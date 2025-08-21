import { NextRequest, NextResponse } from "next/server";

import { findBooking } from "@/modules/booking";
import { PaymentService } from "@/lib/payment";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("token");

    if (!orderId) {
      return NextResponse.redirect("/cancel");
    }

    const paymentService = new PaymentService();
    const captureData = await paymentService.capturePayPalPayment(orderId);

    const purchaseUnit = captureData.purchase_units[0];
    const capture = purchaseUnit.payments.captures[0];
    const localBookingId = capture.custom_id;

    const booking = await findBooking(localBookingId);

    if (!booking) {
      console.error("Booking não encontrado para custom_id:", localBookingId);
      return NextResponse.redirect("/cancel");
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/success`);
  } catch (err) {
    console.error("Erro ao capturar pagamento via return_url:", err);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cancel`);
  }
}
