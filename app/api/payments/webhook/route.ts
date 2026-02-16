import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (!bookingId) {
          console.error("No bookingId in metadata")
          break
        }

        // Update booking with payment info
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentId: session.payment_intent as string,
            paymentStatus: "completed",
            status: "CONFIRMED",
          },
        })

        // Get booking to create notification
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { listing: true },
        })

        if (booking) {
          // Notify customer
          await prisma.notification.create({
            data: {
              userId: booking.customerId,
              bookingId,
              type: "payment_confirmed",
              title: "Payment Confirmed",
              message: `Your payment for booking #${booking.bookingNumber} has been confirmed`,
            },
          })

          // Notify landlord
          await prisma.notification.create({
            data: {
              userId: booking.listing.landlordId,
              bookingId,
              type: "booking_confirmed",
              title: "New Booking",
              message: `New booking confirmed for ${booking.listing.title}`,
            },
          })
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata as Record<string, string>
        const bookingId = metadata?.bookingId

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: "failed",
            },
          })

          // Notify customer
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
          })

          if (booking) {
            await prisma.notification.create({
              data: {
                userId: booking.customerId,
                bookingId,
                type: "payment_failed",
                title: "Payment Failed",
                message: "Your payment could not be processed. Please try again.",
              },
            })
          }
        }

        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          // Find booking with this payment intent
          const booking = await prisma.booking.findFirst({
            where: { paymentId: paymentIntentId },
          })

          if (booking) {
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                paymentStatus: "refunded",
              },
            })

            // Notify customer
            await prisma.notification.create({
              data: {
                userId: booking.customerId,
                bookingId: booking.id,
                type: "payment_refunded",
                title: "Refund Processed",
                message: `A refund of $${(charge.amount_refunded / 100).toFixed(2)} has been processed`,
              },
            })
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
