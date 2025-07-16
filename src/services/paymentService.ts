import axios from 'axios';

export async function createStripePayment(data: any) {
  // Chamada para endpoint backend que cria sessão Stripe
  const response = await axios.post('/api/payments/stripe', data);
  return response.data;
}

export async function createPayPalPayment(data: any) {
  // Chamada para endpoint backend que cria ordem PayPal
  const response = await axios.post('/api/payments/paypal', data);
  return response.data;
} 