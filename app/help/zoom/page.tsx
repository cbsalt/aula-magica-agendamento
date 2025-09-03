import Footer from "@/components/Footer";

export default function Documentation() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Documentação do Aplicativo</h1>
        <p className="mb-4">Última atualização: 2 de setembro de 2025</p>

        <h2 className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2">
          1. Adicionando o Zoom ao Scheduleasier
        </h2>
        <ol className="list-decimal list-inside mb-4 space-y-1">
          <li>Faça login na sua conta Scheduleasier.</li>
          <li>
            Acesse a aba <strong>Integrações</strong> no menu lateral.
          </li>
          <li>
            Localize a integração com <strong>Zoom</strong> e clique em{" "}
            <strong>Conectar</strong>.
          </li>
          <li>
            Você será redirecionado para o Zoom para autorizar o Scheduleasier a
            acessar sua conta.
          </li>
          <li>Após autorizar, a integração estará ativa e pronta para uso.</li>
        </ol>
        <p className="mb-4 font-semibold">Problemas comuns:</p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Se o botão <strong>Conectar</strong> não funcionar, verifique se
            você está logado na conta Zoom correta.
          </li>
          <li>
            Se sua organização restringe apps externos, peça ao administrador do
            Zoom para liberar o Scheduleasier.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2">
          2. Uso do App
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Agendamento automático de links:</strong> sempre que for
            criado um agendamento no Scheduleasier, um link de reunião Zoom é
            gerado automaticamente.
          </li>
          <li>
            <strong>Sincronização de eventos:</strong> todas as reuniões criadas
            ficam sincronizadas no seu calendário também no Zoom.
          </li>
          <li>
            <strong>Lembretes automáticos:</strong> notificações por e-mail são
            enviadas para os participantes quando o pagamento é confirmado.
          </li>
        </ul>
        <p className="mb-4 font-semibold">Pré-requisitos:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Conta Zoom válida.</li>
          <li>App Scheduleasier autorizado na sua conta Zoom.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2">
          3. Removendo a integração com Zoom
        </h2>
        <ol className="list-decimal list-inside mb-4 space-y-1">
          <li>Faça login na sua conta Scheduleasier.</li>
          <li>
            Acesse a aba <strong>Integrações</strong> no menu lateral.
          </li>
          <li>
            Localize a integração com <strong>Zoom</strong> e clique em{" "}
            <strong>Desconectar</strong>.
          </li>
          <li>
            Confirme a desconexão. Os tokens de acesso serão imediatamente
            apagados da nossa base.
          </li>
        </ol>
        <p className="mb-4 font-semibold">Implicações da remoção:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Novos agendamentos não terão links Zoom automaticamente.</li>
          <li>
            Links já criados anteriormente continuam funcionando até a data da
            reunião.
          </li>
        </ul>
        <p className="mb-4 font-semibold">Tratamento de dados:</p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Ao desconectar, todos os tokens de acesso do Zoom são imediatamente
            removidos do sistema.
          </li>
          <li>
            Nenhuma reunião ou dado pessoal é mantido, exceto registros de
            auditoria exigidos por lei.
          </li>
        </ul>
      </main>
      <Footer />
    </div>
  );
}
