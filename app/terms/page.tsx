import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        <p className="mb-4">Última atualização: 26 de agosto de 2025</p>

        <p className="mb-4">
          Bem-vindo ao aplicativo <strong>scheduleasier</strong>. Ao usar nosso
          serviço, você concorda com estes Termos de Serviço. Leia atentamente
          antes de utilizar a plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Aceitação dos Termos
        </h2>
        <p className="mb-4">
          Ao acessar ou usar o scheduleasier, você concorda em cumprir estes
          termos, nossa Política de Privacidade e todas as leis aplicáveis.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. Uso do Serviço</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Você concorda em usar o aplicativo apenas para fins legais e
            permitidos.
          </li>
          <li>
            É proibido enviar conteúdo malicioso ou violar direitos de
            terceiros.
          </li>
          <li>
            Você é responsável por manter a confidencialidade de sua conta e
            senha.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Conteúdo do Usuário
        </h2>
        <p className="mb-4">
          Você é responsável por todo conteúdo que enviar ou compartilhar no
          aplicativo. O scheduleasier não se responsabiliza por perdas ou danos
          decorrentes de seu conteúdo.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Modificações do Serviço
        </h2>
        <p className="mb-4">
          Podemos atualizar, suspender ou descontinuar recursos do aplicativo a
          qualquer momento, sem aviso prévio.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Limitação de Responsabilidade
        </h2>
        <p className="mb-4">
          O ScheduleAsier não se responsabiliza por danos diretos, indiretos ou
          consequenciais resultantes do uso do aplicativo, dentro dos limites
          permitidos por lei.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Rescisão</h2>
        <p className="mb-4">
          Podemos suspender ou encerrar sua conta caso haja violação destes
          termos ou suspeita de uso indevido.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          7. Legislação Aplicável
        </h2>
        <p className="mb-4">
          Estes termos são regidos pelas leis do Brasil. Qualquer disputa será
          resolvida no foro competente da cidade de residência do usuário,
          quando aplicável.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">8. Contato</h2>
        <p className="mb-4">
          Para dúvidas sobre os Termos de Serviço, entre em contato:{" "}
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
