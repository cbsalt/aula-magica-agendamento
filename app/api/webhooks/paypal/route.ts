import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processBooking } from "@/lib/process.booking";
import { NextApiResponse } from "next";

export async function POST(req: NextRequest, res: NextApiResponse) {
  try {
    const body = await req.json();

    if (body.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const capture = body.resource;
    const localBookingId = capture.custom_id;
    const orderId = capture.id;
    const amount = parseFloat(capture.amount.value);
    const currency = capture.amount.currency_code;

    const booking = await prisma.booking.findUnique({
      where: { id: localBookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking não encontrado" },
        { status: 404 }
      );
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "confirmed", paypalOrderId: orderId, amount, currency },
    });

    await processBooking({
      booking,
      paymentId: localBookingId,
      teacherId: booking.teacherId,
      metadata: {
        studentName: booking.studentName,
        studentEmail: booking.studentEmail,
        date: booking.date.toISOString().split("T")[0],
        time: booking.time,
      },
      amount,
      currency,
    });

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Erro no webhook PayPal:", err);
    return NextResponse.json(
      { error: "Erro no webhook PayPal" },
      { status: 500 }
    );
  }
}
