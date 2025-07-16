# Configuração do Projeto Talk Gringo

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

### Autenticação (NextAuth)
```env
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key-here
```

### Google OAuth (Para Google Calendar)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Zoom API
```env
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
```

### Stripe (Pagamentos)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### PayPal (Pagamentos)
```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### Banco de Dados
```env
DATABASE_URL="file:./dev.db"
```

## Configuração das APIs

### Google Calendar
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Calendar
4. Configure as credenciais OAuth 2.0
5. Adicione `http://localhost:3002/api/auth/callback/google` como URI de redirecionamento

### Zoom
1. Acesse [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Crie um novo app do tipo "Server-to-Server OAuth"
3. Configure as permissões necessárias:
   - Meeting:Read
   - Meeting:Write
4. Copie o Client ID e Client Secret

### Stripe
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá para Developers > API keys
3. Copie as chaves de teste (publishable key e secret key)
4. Para produção, use as chaves live

### PayPal
1. Acesse [PayPal Developer](https://developer.paypal.com/)
2. Crie um app no sandbox
3. Copie o Client ID e Client Secret
4. Para produção, use as credenciais live

## Funcionalidades Implementadas

### ✅ Integração com Pagamentos (Plataforma Intermediadora)
- **Professor**: Configura como quer receber (Stripe Connect ou PayPal)
- **Aluno**: Escolhe como quer pagar (cartão de crédito ou PayPal)
- **Plataforma**: Processa pagamento e repassa automaticamente para o professor
- **Stripe**: Implementação completa com checkout sessions e transfers
- **PayPal**: Implementação completa com Orders API e Payouts

### ✅ Integração com Zoom
- Formulário para email e senha da conta Zoom
- Autenticação via OAuth com password grant
- Criação automática de reuniões
- Geração de links de reunião

### ✅ Geração de Link Público
- Link único e fixo para cada professor: `/appointment/{professorId}`
- Gerado após configurar Zoom, pagamentos e preço da aula
- Página pública para agendamento pelos alunos
- Fluxo completo de agendamento e pagamento

### ✅ Integração com Google Calendar
- Busca todos os eventos da agenda do professor
- Disponibilidade baseada nos eventos (evita conflitos)
- Exibição visual dos horários disponíveis
- Mostra eventos do dia para transparência

### ✅ Integração com Zoom
- Formulário com validações obrigatórias
- Validação de formato de e-mail
- Validação de senha (mínimo 6 caracteres)
- Feedback visual em tempo real
- Integração pronta para produção (apenas envs necessárias)

## Como Usar

1. **Professor configura conta**:
   - Faz login com Google
   - Conecta Google Calendar
   - Configura Zoom (email/senha com validações)
   - Configura como quer receber pagamentos (Stripe Connect ou PayPal)
   - Define valor da aula
   - Gera link público único e fixo

2. **Aluno agenda aula**:
   - Acessa link público do professor
   - Escolhe data e horário
   - Preenche dados pessoais
   - Escolhe como quer pagar (cartão ou PayPal)
   - Efetua pagamento
   - Recebe confirmação e link da reunião

3. **Processamento automático**:
   - Plataforma processa pagamento do aluno
   - Repassa valor automaticamente para o professor
   - Gera link da reunião Zoom

## Estrutura do Projeto

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── bookings/route.ts
│   ├── teachers/
│   │   ├── [id]/route.ts
│   │   ├── availability/route.ts
│   │   └── me/public-link/route.ts
│   └── zoom/connect/route.ts
├── appointment/[id]/page.tsx
└── dashboard/page.tsx

src/
├── components/
│   ├── Dashboard.tsx
│   ├── PublicBookingPage.tsx
│   └── PaymentForms/
├── lib/
│   ├── payment.ts
│   ├── zoom.ts
│   └── google-calendar.ts
└── locales/
    ├── pt-BR/
    └── en-US/
```

## Próximos Passos

1. Configure as variáveis de ambiente
2. Execute `npm run dev`
3. Acesse `http://localhost:3002`
4. Teste o fluxo completo de agendamento

## Notas Importantes

- O projeto está configurado para desenvolvimento (sandbox/test)
- Para produção, atualize as URLs e credenciais
- As senhas do Zoom são armazenadas em texto plano (em produção, deve ser criptografado)
- O banco de dados é SQLite para desenvolvimento 