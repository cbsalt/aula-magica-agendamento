
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export class PaymentService {
  async createPayment(data: {
    amount: number
    currency: string
    teacherId: string
    studentEmail: string
    paymentMethod: string
    paymentConfig: any
  }) {
    try {
      switch (data.paymentMethod) {
        case 'stripe':
          return await this.createStripePayment(data)
        case 'paypal':
          return await this.createPayPalPayment(data)
        case 'payoneer':
          return await this.createPayoneerPayment(data)
        default:
          throw new Error('Método de pagamento não suportado')
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      throw error
    }
  }

  private async createStripePayment(data: any) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: 'Aula Particular',
            },
            unit_amount: data.amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
      customer_email: data.studentEmail,
      metadata: {
        teacherId: data.teacherId,
        bookingId: 'pending',
      },
    })

    return {
      id: session.id,
      url: session.url,
    }
  }

  private async createPayPalPayment(data: any) {
    // Implement PayPal payment creation
    // This would integrate with PayPal's API
    throw new Error('PayPal integration not implemented yet')
  }

  private async createPayoneerPayment(data: any) {
    // Implement Payoneer payment creation
    // This would integrate with Payoneer's API
    throw new Error('Payoneer integration not implemented yet')
  }
}
