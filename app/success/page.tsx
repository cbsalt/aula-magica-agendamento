import SuccessClient from "@/components/SuccessClient";
import { getStripeInstance } from "@/lib/payment";
import ErrorMessage from "@/components/ErrorMessage";

interface Props {
  searchParams: { session_id?: string };
}

export default async function SuccessPage(props) {
  const sessionId = props?.searchParams.session_id;
  if (!sessionId) {
    return <ErrorMessage message="Sessão de pagamento não encontrada." />;
  }

  try {
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const metadata = session.metadata;
    const { studentEmail, date, time } = metadata || {};
    if (!studentEmail || !date || !time) {
      return (
        <ErrorMessage message="Não foi possível recuperar os detalhes da sua aula. Por favor, entre em contato com o suporte." />
      );
    }

    return (
      <SuccessClient
        metadata={
          metadata as { studentName: string; date: string; time: string }
        }
      />
    );
  } catch (error) {
    console.log("Erro ao buscar sessão do Stripe:", error);
    return (
      <ErrorMessage message="Ocorreu um erro ao verificar seu pagamento. Se você recebeu o comprovante, entre em contato conosco." />
    );
  }
}
