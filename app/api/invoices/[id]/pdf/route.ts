import { auth } from "@/auth"
import { generateInvoicePdf } from "@/lib/invoices"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { userId: true, invoiceNumber: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const isOwner = invoice.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pdfBytes = await generateInvoicePdf(id)

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Invoice not found" ? 404 : 500
    console.error("Invoice PDF error:", error)
    return NextResponse.json({ error: message }, { status })
  }
}
