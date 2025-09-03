import Footer from "@/components/Footer";

export default function Support() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Suporte</h1>
        <p className="mb-4">Última atualização: 2 de setembro de 2025</p>

        <p className="mb-4">
          Para qualquer dúvida ou problema relacionado ao{" "}
          <strong>scheduleasier</strong> ou à integração com o Zoom, nossa
          equipe de suporte está à disposição pelo e-mail:
        </p>

        <p className="mb-6">
          <a
            href="mailto:contato@scheduleasier.com"
            className="text-blue-600 hover:underline font-semibold"
          >
            contato@scheduleasier.com
          </a>
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          Horário de atendimento
        </h2>
        <p className="mb-4">Segunda a sexta-feira, das 9h às 18h (GMT-3).</p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          Prazo de primeira resposta (SLA)
        </h2>
        <p className="mb-4">
          Nosso compromisso é responder a todas as solicitações em até{" "}
          <strong>24 horas úteis</strong>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
