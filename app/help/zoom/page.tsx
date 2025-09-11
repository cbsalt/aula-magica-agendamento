import Footer from "@/components/Footer";
import { Plug, Calendar, Trash2, LifeBuoy } from "lucide-react";

export default function Documentation() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Documentação do Aplicativo</h1>
        <p className="mb-4">Última atualização: 4 de setembro de 2025</p>

        {/* 1. Adicionando o App */}
        <h2 className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2">
          <Plug className="w-6 h-6 text-blue-600" />
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
          <li>
            Na tela de consentimento do Zoom, clique em <strong>Allow</strong>.
            A permissão <em>Create a meeting for a user</em> será solicitada
            para que o app possa criar reuniões automaticamente em seu nome.
          </li>
          <li>Após autorizar, a integração estará ativa e pronta para uso.</li>
        </ol>

        <p className="mb-4 font-semibold flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-indigo-600" /> Solução de problemas:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Se o botão <strong>Conectar</strong> não funcionar, verifique se
            você está logado na conta Zoom correta.
          </li>
          <li>
            Se sua organização restringe apps externos, peça ao administrador do
            Zoom para liberar o Scheduleasier.
          </li>
          <li>
            Se o problema persistir, entre em contato com nosso suporte em{" "}
            <a href="#suporte" className="text-blue-600 hover:underline">
              contato@scheduleasier.com
            </a>
            .
          </li>
        </ul>

        {/* 2. Uso do App */}
        <h2 className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          2. Uso do App
        </h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          Agendamento automático de links
        </h3>
        <p className="mb-2">
          Quando o professor gera um link único e o aluno agenda uma aula, o
          Scheduleasier cria automaticamente uma reunião no Zoom associada ao
          agendamento.
        </p>
        <p className="mb-4">
          <strong>Pré-requisito:</strong> integração com Zoom autorizada.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          Sincronização de eventos
        </h3>
        <p className="mb-2">
          Todas as reuniões criadas no Scheduleasier ficam sincronizadas também
          no seu Zoom, garantindo que você veja os compromissos em ambas as
          plataformas.
        </p>
        <p className="mb-4">
          <strong>Pré-requisito:</strong> conta Zoom válida.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          Lembretes automáticos
        </h3>
        <p className="mb-2">
          O aluno recebe notificações por e-mail assim que o pagamento é
          confirmado. Se a integração com Zoom estiver ativa, o link enviado no
          e-mail será da reunião Zoom.
        </p>
        <p className="mb-4">
          <strong>Pré-requisito:</strong> agendamento pago e integração ativa.
        </p>

        {/* 3. Removendo o App */}
        <h2 className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-600" />
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

        {/* 4. Suporte */}
        <h2
          id="suporte"
          className="text-2xl font-semibold mt-6 mb-2 flex items-center gap-2"
        >
          <LifeBuoy className="w-5 h-5 text-indigo-600" />
          4. Suporte
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            E-mail:{" "}
            <a
              href="mailto:contato@scheduleasier.com"
              className="text-blue-600 hover:underline"
            >
              contato@scheduleasier.com
            </a>
          </li>
          <li>Horário de atendimento: Seg a Sex, 9h às 18h (Brasil)</li>
          <li>SLA de primeira resposta: até 24h úteis</li>
        </ul>
      </main>
      <Footer />
    </div>
  );
}
