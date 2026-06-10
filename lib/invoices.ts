import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from '@/lib/prisma'
import type { InvoiceType } from '@prisma/client'

const VAT_RATE_DEFAULT = 0.18

export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const seq = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceSequence.findUnique({ where: { year } })
    if (existing) {
      return tx.invoiceSequence.update({
        where: { year },
        data: { lastNumber: { increment: 1 } },
      })
    }
    return tx.invoiceSequence.create({ data: { year, lastNumber: 1 } })
  })
  return `GDN-${year}-${String(seq.lastNumber).padStart(6, '0')}`
}

export async function createInvoicesForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { include: { landlord: true } }, customer: true },
  })
  if (!booking) throw new Error('Booking not found')

  const subtotal = booking.totalPrice
  const vatRate = VAT_RATE_DEFAULT
  const vatAmount = Math.round(subtotal * vatRate)
  const total = subtotal + vatAmount

  const clientNumber = await nextInvoiceNumber()
  const hostNumber = await nextInvoiceNumber()

  const [clientInvoice, hostInvoice] = await prisma.$transaction([
    prisma.invoice.create({
      data: {
        invoiceNumber: clientNumber,
        bookingId,
        userId: booking.customerId,
        type: 'CLIENT' as InvoiceType,
        subtotal,
        vatRate,
        vatAmount,
        total,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: hostNumber,
        bookingId,
        userId: booking.listing.landlordId,
        type: 'HOST' as InvoiceType,
        subtotal,
        vatRate: 0,
        vatAmount: 0,
        total: subtotal,
      },
    }),
  ])

  return { clientInvoice, hostInvoice }
}

export async function generateInvoicePdf(invoiceId: string): Promise<Uint8Array> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      booking: { include: { listing: true, customer: true } },
      user: true,
    },
  })
  if (!invoice) throw new Error('Invoice not found')

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const lines = [
    { text: 'Garden', font: bold, size: 22, y: 800 },
    { text: invoice.type === 'CLIENT' ? 'FACTURE CLIENT' : 'RECU HOTE', font: bold, size: 14, y: 770 },
    { text: `N° ${invoice.invoiceNumber}`, font, size: 11, y: 750 },
    { text: `Date: ${invoice.issuedAt.toLocaleDateString('fr-FR')}`, font, size: 11, y: 735 },
    { text: `Réservation: ${invoice.booking.bookingNumber}`, font, size: 11, y: 720 },
    { text: `Annonce: ${invoice.booking.listing.title}`, font, size: 11, y: 705 },
    { text: `Client: ${invoice.booking.customer.name ?? invoice.booking.customer.email}`, font, size: 11, y: 690 },
    { text: `Sous-total: ${invoice.subtotal.toLocaleString('fr-FR')} XOF`, font, size: 11, y: 660 },
    { text: `TVA (${Math.round(invoice.vatRate * 100)}%): ${invoice.vatAmount.toLocaleString('fr-FR')} XOF`, font, size: 11, y: 645 },
    { text: `Total: ${invoice.total.toLocaleString('fr-FR')} XOF`, font: bold, size: 13, y: 620 },
  ]

  for (const line of lines) {
    page.drawText(line.text, { x: 50, y: line.y, size: line.size, font: line.font, color: rgb(0.1, 0.1, 0.1) })
  }

  return pdf.save()
}
