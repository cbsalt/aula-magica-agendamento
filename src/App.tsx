import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Aula Mágica - Agendamento
        </h1>
        <p className="text-muted-foreground mb-8">
          Este projeto foi migrado para Next.js. 
          <br />
          A versão de produção utiliza o App Router do Next.js.
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Para desenvolvimento, acesse as rotas do Next.js:</p>
          <ul className="mt-2 space-y-1">
            <li>• <strong>/</strong> - Landing Page</li>
            <li>• <strong>/dashboard</strong> - Dashboard do Professor</li>
            <li>• <strong>/[professor]/[id]</strong> - Agendamento Público</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App