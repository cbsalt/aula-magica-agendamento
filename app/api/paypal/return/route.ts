import { NextRequest, NextResponse } from "next/server";

import { findBooking } from "@/modules/booking";
import { PaymentService } from "@/lib/payment";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("token");
  if (!orderId) return NextResponse.redirect("/cancel");

  const paymentService = new PaymentService();

  try {
    const captureData = await paymentService.capturePayPalPayment(orderId);

    const purchaseUnit = captureData.purchase_units[0];
    const capture = purchaseUnit.payments.captures[0];
    const localBookingId = capture.custom_id;

    if (!localBookingId) {
      console.error("custom_id não retornado no capture");
      return NextResponse.redirect("/cancel");
    }

    const booking = await findBooking(localBookingId);

    if (!booking) {
      console.error("Booking não encontrado para custom_id:", localBookingId);
      return NextResponse.redirect("/cancel");
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/success`);
  } catch (err) {
    const errorData = err.response?.data;

    const declined = errorData?.details?.[0]?.issue === "INSTRUMENT_DECLINED";
    if (declined) {
      const redirectLink = errorData?.links?.find(
        (link) => link.rel === "redirect"
      )?.href;

      if (redirectLink) {
        return NextResponse.redirect(redirectLink);
      }
    }

    console.error("Falha na captura PayPal:", errorData || err.message);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cancel`);
  }
}
