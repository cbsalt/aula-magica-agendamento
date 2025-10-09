import { Footer } from "@/components";

export default function FeesPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Política de Taxas</h1>
        <p className="mb-4">Última atualização: 8 de outubro de 2025</p>

        <p className="mb-4">
          Esta página explica de forma transparente como funcionam as{" "}
          <strong>taxas de transação da plataforma scheduleasier</strong>. Nosso
          objetivo é garantir clareza e previsibilidade para todos os
          profissionais e clientes que utilizam o sistema.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Valor da taxa</h2>
        <p className="mb-4">
          Será cobrada uma taxa de <strong>15% (quinze por cento)</strong> sobre
          o valor de cada transação realizada dentro da plataforma
          <strong> scheduleasier</strong>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Como a taxa é aplicada
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            A taxa é aplicada automaticamente no momento da confirmação do
            pagamento.
          </li>
          <li>
            O valor líquido (valor recebido menos 15%) será repassado ao
            profissional cadastrado.
          </li>
          <li>
            O repasse ocorre de acordo com as condições e prazos estabelecidos
            na conta de pagamento vinculada.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Exemplos práticos
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Se um serviço custa <strong>R$ 100,00</strong>, a taxa será de{" "}
            <strong>R$ 15,00</strong> e o profissional receberá{" "}
            <strong>R$ 85,00</strong>.
          </li>
          <li>
            Se um serviço custa <strong>R$ 200,00</strong>, a taxa será de{" "}
            <strong>R$ 30,00</strong> e o profissional receberá{" "}
            <strong>R$ 170,00</strong>.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. O que está incluso nesta taxa
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Custos de operação e manutenção da plataforma;</li>
          <li>Infraestrutura de agendamento e pagamentos online;</li>
          <li>Custos de segurança e conformidade financeira;</li>
          <li>Suporte e melhorias contínuas no sistema.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Alterações na política de taxas
        </h2>
        <p className="mb-4">
          A <strong>scheduleasier</strong> poderá atualizar esta política de
          taxas a qualquer momento, mediante comunicação prévia aos usuários.
          Mudanças no percentual ou forma de cobrança serão informadas com
          antecedência razoável.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Contato</h2>
        <p className="mb-4">
          Em caso de dúvidas sobre esta política de taxas, entre em contato com
          nossa equipe de suporte pelo e-mail{" "}
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
