import { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import { findBooking, updateBooking } from "@/modules/booking";
import { processBooking, processBatchBooking } from "@/lib/process.booking";

export async function POST(req: NextRequest) {
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

    const booking = await findBooking(localBookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking não encontrado" },
        { status: 404 }
      );
    }

    if (booking.status === "confirmed" && booking.paypalOrderId === orderId) {
      return NextResponse.json({ received: true });
    }

    await updateBooking({
      booking,
      data: {
        status: "confirmed",
        paypalOrderId: orderId,
        amount,
        currency,
      },
    });

    if (booking.batchId) {
      await processBatchBooking({
        masterBooking: booking,
        teacherId: booking.teacherId,
        amount,
        currency,
      });
    } else {
      await processBooking({
        booking,
        teacherId: booking.teacherId,
        metadata: {
          studentName: booking.studentName,
          studentEmail: booking.studentEmail,
          date: booking.date.toISOString().split("T")[0],
          time: booking.time,
        },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Erro no webhook PayPal:", err);
    return NextResponse.json(
      { error: "Erro no webhook PayPal" },
      { status: 500 }
    );
  }
}
