import Stripe from "stripe";

// Initialize Stripe
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
    studentPaymentMethod: "creditCard" | "paypal"; // Como o aluno quer pagar
    paymentConfig: any;
    metadata: {
      teacherId: string;
      studentEmail: string;
      studentName: string;
      date: string;
      time: string;
    };
  }) {
    try {
      // A plataforma processa o pagamento do aluno
      let paymentSession;

      switch (data.studentPaymentMethod) {
        case "creditCard":
          paymentSession = await this.createStripePayment(data);
          break;
        case "paypal":
          paymentSession = await this.createPayPalPayment(data);
          break;
        default:
          throw new Error("Método de pagamento não suportado");
      }

      // Após o pagamento ser confirmado, a plataforma repassa para o professor
      // Esta lógica seria implementada nos webhooks de confirmação
      // await this.scheduleTeacherPayout(data);

      return paymentSession;
    } catch (error) {
      console.error("Payment creation error:", error);
      throw error;
    }
  }

  private async scheduleTeacherPayout(data: any) {
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

  private async createStripePayment(data: any) {
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: "Aula Particular",
            },
            unit_amount: data.amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
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

  // Create PayPal order using PayPal API
  private async createPayPalPayment(data: any) {
    const { studentEmail, metadata, currency, amount, teacherId } = data;

    const invoiceData = {
      studentName: metadata.studentName,
      date: metadata.date,
      time: metadata.time,
      studentEmail,
    };

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toString(),
          },
          description: "Aula Particular",
          custom_id: teacherId,
          invoice_id: Buffer.from(JSON.stringify(invoiceData))
            .toString("base64")
            .slice(0, 127),
        },
      ],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL}/success?session_id={PAYMENT_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
        brand_name: "scheduleasier",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
      },
    };

    try {
      const response = await fetch(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
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
        url: order.links.find((link: any) => link.rel === "approve")?.href,
      };
    } catch (error) {
      console.error("PayPal payment creation error:", error);
      throw new Error("Erro ao criar pagamento PayPal");
    }
  }

  private async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const data = await response.json();
    return data.access_token;
  }
}
