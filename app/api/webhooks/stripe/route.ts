import { NextRequest, NextResponse } from "next/server";
import { getStripeInstance } from "@/lib/payment";
import { processBatchBooking, processBooking } from "@/lib/process.booking";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body);
  const sig = req.headers.get("stripe-signature") as string;
  const stripe = getStripeInstance();

  let event;
  let processedBooking;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const booking = await prisma.booking.findFirst({
      where: { paymentId: session.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking não encontrado" },
        { status: 404 }
      );
    }

    if (booking.batchId) {
      processBatchBooking({
        masterBooking: booking,
        paymentId: session.id,
        teacherId: booking.teacherId,
        amount: session.amount_total / 100,
        currency: session.currency,
      });
    } else {
      processedBooking = await processBooking({
        booking,
        paymentId: session.id,
        teacherId: session.metadata.teacherId,
        metadata: {
          studentName: session.metadata.studentName,
          studentEmail: session.metadata.studentEmail,
          date: session.metadata.date,
          time: session.metadata.time,
        },
        amount: session.amount_total / 100,
        currency: session.currency,
      }).catch((err) => {
        console.error("Erro ao processar booking:", err);
      });
    }
  }

  return NextResponse.json({ received: true, processedBooking });
}
