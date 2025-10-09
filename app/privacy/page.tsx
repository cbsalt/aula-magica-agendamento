import { Footer } from "@/components";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
        <p className="mb-4">Última atualização: 26 de agosto de 2025</p>

        <p className="mb-4">
          A sua privacidade é importante para nós. Esta Política de Privacidade
          explica como coletamos, usamos e protegemos as informações pessoais de
          usuários do aplicativo <strong>scheduleasier</strong>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Informações que coletamos
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Informações fornecidas diretamente pelo usuário: nome, e-mail,
            telefone, dados de cadastro;
          </li>
          <li>
            Informações de uso: logs de acesso, preferências, interações com o
            aplicativo;
          </li>
          <li>
            Informações técnicas: endereço IP, tipo de dispositivo, sistema
            operacional.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Como usamos suas informações
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Para fornecer, personalizar e melhorar nossos serviços;</li>
          <li>
            Para enviar notificações sobre atualizações, confirmações de
            agendamento ou promoções;
          </li>
          <li>Para monitoramento e prevenção de fraudes;</li>
          <li>Para cumprir obrigações legais e regulatórias.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Compartilhamento de informações
        </h2>
        <p className="mb-4">
          Não vendemos seus dados. Podemos compartilhar informações com:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Prestadores de serviços essenciais ao funcionamento do aplicativo;
          </li>
          <li>Autoridades legais, quando exigido por lei;</li>
          <li>Em caso de fusão, aquisição ou reorganização da empresa.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Segurança</h2>
        <p className="mb-4">
          Implementamos medidas técnicas e administrativas para proteger seus
          dados contra acesso não autorizado, alteração ou destruição.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Seus direitos</h2>
        <p className="mb-4">
          Você pode acessar, corrigir ou solicitar a exclusão de seus dados
          pessoais. Para exercer seus direitos, entre em contato conosco pelo
          e-mail{" "}
          <a
            href="mailto:contato@scheduleasier.com"
            className="text-blue-600 hover:underline"
          >
            contato@scheduleasier.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          6. Alterações nesta política
        </h2>
        <p className="mb-4">
          Podemos atualizar esta política periodicamente. A data da última
          atualização será sempre exibida no topo.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contato</h2>
        <p className="mb-4">
          Se tiver dúvidas sobre esta política, entre em contato conosco:{" "}
          <a
            href="mailto:contato@scheduleasier.com"
            className="text-blue-600 hover:underline"
          >
            contato@scheduleasier.com
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
