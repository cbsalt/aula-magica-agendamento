import SuccessClient from "@/components/SuccessClient";
import { getStripeInstance } from "@/lib/payment";
import ErrorMessage from "@/components/ErrorMessage";

interface Props {
  searchParams?: { session_id?: string };
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return <SuccessClient />;
  }

  try {
    const stripe = getStripeInstance();
    await stripe.checkout.sessions.retrieve(sessionId);

    return <SuccessClient />;
  } catch (error) {
    return (
      <ErrorMessage message="Ocorreu um erro ao verificar seu pagamento. Se você recebeu o comprovante, entre em contato conosco." />
    );
  }
}
