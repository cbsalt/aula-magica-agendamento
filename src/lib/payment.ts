import axios from "axios";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import Stripe from "stripe";

import { AppError } from "@/errors/AppError";
import {
  createBatchBookings,
  createBooking,
  findBookingFirst,
  isExpired,
  updateBooking,
} from "@/modules/booking";
import { prisma } from "./prisma";

export function getStripeInstance(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Stripe Secret Key (STRIPE_SECRET_KEY) não está definida.");
  }

  return new Stripe(key, {
    apiVersion: "2025-06-30.basil",
  });
}

export class PaymentService {
  async createPayment(data: {
    amount: number;
    currency: string;
    teacherId: string;
    studentEmail: string;
    studentPaymentMethod: "creditCard" | "paypal";
    paymentConfig;
    metadata: {
      teacherId: string;
      studentEmail: string;
      studentName: string;
      date: string;
      time: string;
    };
    timeSlots?: Array<{ date: Date; time: string }>;
    request: NextRequest;
  }) {
    const isBatchProcessing = data.timeSlots && data.timeSlots.length > 1;

    if (isBatchProcessing) {
      for (const timeSlot of data.timeSlots) {
        const existingBooking = await findBookingFirst({
          data: {
            teacherId: data.teacherId,
            time: timeSlot.time,
            date: timeSlot.date,
            status: { in: ["pending", "confirmed"] },
          },
        });

        if (existingBooking) {
          const isBookingExpired = isExpired(existingBooking);

          if (isBookingExpired) {
            await updateBooking({
              booking: existingBooking,
              data: {
                status: "expired",
                notes: "Pagamento não concluído no prazo",
              },
            });
          } else {
            throw new AppError(
              `O horário ${
                timeSlot.time
              } em ${timeSlot.date.toLocaleDateString()} foi bloqueado recentemente. Tente outro ou volte em alguns minutos.`,
              409
            );
          }
        }
      }

      const { bookings, batchId } = await createBatchBookings({
        bookingData: data,
        timeSlots: data.timeSlots,
        notes: "Aguardando pagamento",
        status: "pending",
      });

      const masterBooking = bookings[0];

      try {
        let paymentSession;

        switch (data.studentPaymentMethod) {
          case "creditCard":
            paymentSession = await this.createStripePayment(data);
            break;
          case "paypal":
            paymentSession = await this.createPayPalPayment(
              data,
              masterBooking.id
            );
            break;
          default:
            throw new Error("Método de pagamento não suportado");
        }

        await prisma.booking.updateMany({
          where: { batchId },
          data: { paymentId: paymentSession.id },
        });

        return paymentSession;
      } catch (error) {
        await prisma.booking.deleteMany({ where: { batchId } });
        throw error;
      }
    } else {
      const bookingDate = new Date(data.metadata.date);

      const existingBooking = await findBookingFirst({
        data: {
          teacherId: data.teacherId,
          time: data.metadata.time,
          date: bookingDate,
          status: { in: ["pending", "confirmed"] },
        },
      });

      if (existingBooking) {
        const isBookingExpired = isExpired(existingBooking);

        if (isBookingExpired) {
          await updateBooking({
            booking: existingBooking,
            data: {
              status: "expired",
              notes: "Pagamento não concluído no prazo",
            },
          });
        } else {
          throw new AppError(
            "Esse horário foi bloqueado recentemente. Tente outro ou volte em alguns minutos.",
            409
          );
        }
      }

      const booking = await createBooking({
        bookingData: data,
        bookingDate,
        notes: "Aguardando pagamento",
        status: "pending",
      });

      try {
        let paymentSession;

        switch (data.studentPaymentMethod) {
          case "creditCard":
            paymentSession = await this.createStripePayment(data);
            break;
          case "paypal":
            paymentSession = await this.createPayPalPayment(data, booking.id);
            break;
          default:
            throw new Error("Método de pagamento não suportado");
        }

        await updateBooking({
          booking,
          data: { paymentId: paymentSession.id },
        });

        return paymentSession;
      } catch (error) {
        await prisma.booking.delete({ where: { id: booking.id } });
        throw error;
      }
    }
  }

  private async scheduleTeacherPayout(data) {
    // Esta função seria chamada quando o pagamento for confirmado
    // A plataforma repassa o valor para o professor usando os dados configurados
    const { paymentConfig, amount, currency } = data;

    if (paymentConfig.receiveViaStripe && paymentConfig.stripeAccountId) {
      // Repassa via Stripe Connect
      await this.transferToStripeAccount(
        paymentConfig.stripeAccountId,
        amount,
        currency
      );
    } else if (paymentConfig.receiveViaPayPal && paymentConfig.paypalEmail) {
      // Repassa via PayPal
      await this.transferToPayPal(paymentConfig.paypalEmail, amount, currency);
    }
  }

  private async transferToStripeAccount(
    stripeAccountId: string,
    amount: number,
    currency: string
  ) {
    try {
      const stripe = getStripeInstance();
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination: stripeAccountId,
        description: "Pagamento de aula - scheduleasier",
      });

      console.log("Transfer to Stripe account:", transfer.id);
      return transfer;
    } catch (error) {
      console.error("Error transferring to Stripe account:", error);
      throw error;
    }
  }

  private async transferToPayPal(
    paypalEmail: string,
    amount: number,
    currency: string
  ) {
    try {
      // Implementar transferência via PayPal Payouts API
      // Esta é uma implementação simplificada
      console.log(`Transfer ${amount} ${currency} to PayPal: ${paypalEmail}`);

      // Em produção, usar PayPal Payouts API
      // const payout = await paypalClient.execute(new paypal.payouts.PayoutsPostRequest()...)

      return { success: true, email: paypalEmail };
    } catch (error) {
      console.error("Error transferring to PayPal:", error);
      throw error;
    }
  }

  private async createStripePayment(data) {
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            product: process.env.STRIPE_PRODUCT_ID,
            currency: data.currency.toLowerCase(),
            unit_amount: Math.round(data.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${data.request.headers.get(
        "origin"
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
      customer_email: data.studentEmail,
      metadata: {
        teacherId: data.teacherId,
        studentEmail: data.studentEmail,
        studentName: data.metadata.studentName,
        date: data.metadata.date,
        time: data.metadata.time,
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  private async createPayPalPayment(data, bookingId) {
    const { currency, amount } = data;

    const uniqueInvoiceId = `${Date.now()}:${randomUUID()}`;

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          description: "Aula Particular",
          custom_id: bookingId,
          invoice_id: uniqueInvoiceId,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL}/api/paypal/return`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
        brand_name: "scheduleasier",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
      },
    };

    const response = await fetch(
      `${process.env.PAYPAL_API}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getPayPalAccessToken()}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      throw new Error(`PayPal API error: ${response.statusText}`);
    }

    const order = await response.json();

    return {
      id: order.id,
      url: order.links.find((link) => link.rel === "approve")?.href,
    };
  }

  private async getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const data = await response.json();
    return data.access_token;
  }

  async capturePayPalPayment(orderId: string) {
    try {
      const accessToken = await this.getPayPalAccessToken();

      const response = await axios.post(
        `${process.env.PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Erro ao capturar pagamento PayPal:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao capturar pagamento PayPal");
    }
  }
}
