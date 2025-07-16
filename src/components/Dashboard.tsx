"use client";

import { useState, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Perfil", icon: "👤" },
    { id: "calendar", label: "Calendário", icon: "📅" },
    { id: "integrations", label: "Integrações", icon: "🔗" },
    { id: "payments", label: "Pagamentos", icon: "💳" },
    { id: "public-link", label: "Link Público", icon: "🔗" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard do Professor
            </h1>
            <div className="flex items-center space-x-4">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || ""}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">
                {session?.user?.name}
              </span>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "calendar" && <CalendarSection />}
            {activeTab === "integrations" && <IntegrationsSection />}
            {activeTab === "payments" && <PaymentsSection />}
            {activeTab === "public-link" && <PublicLinkSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileSection = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    price: "",
    currency: "BRL",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    // Save profile data
    console.log("Saving profile:", formData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Dados do Perfil</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ""}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-medium">{session?.user?.name}</h3>
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Biografia
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conte um pouco sobre você e sua experiência..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço por aula
              </label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Moeda
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BRL">BRL - Real</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const weekDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
  { label: "Sábado", value: 6 },
];

const defaultSchedule = weekDays.map((day) => ({
  dayOfWeek: day.value,
  startTime: "",
  endTime: "",
}));

const CalendarSection = () => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [workSchedule, setWorkSchedule] = useState(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Busca horários salvos ao carregar
  useEffect(() => {
    fetch("/api/teachers/me/availability")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkSchedule(
            weekDays.map((day) => {
              const found = data.find((d: any) => d.dayOfWeek === day.value);
              return found
                ? {
                    dayOfWeek: day.value,
                    startTime: found.startTime,
                    endTime: found.endTime,
                  }
                : { dayOfWeek: day.value, startTime: "", endTime: "" };
            })
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Checa status de conexão ao Google Calendar
  useEffect(() => {
    fetch('/api/teachers/me')
      .then(res => res.json())
      .then(data => setIsConnected(!!data.googleAccessToken))
      .catch(() => setIsConnected(false));
  }, [session]);

  const handleChange = (
    idx: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setWorkSchedule((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const toSave = workSchedule.filter(
      (item) => item.startTime && item.endTime
    );
    const res = await fetch("/api/teachers/me/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    });
    if (res.ok) {
      setMessage("Horário salvo com sucesso!");
    } else {
      setMessage("Erro ao salvar horário.");
    }
    setSaving(false);
  };

  const connectCalendar = () => {
    signIn('google'); // Usa o fluxo seguro do NextAuth
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Disponibilidade semanal
          </h2>
          <p className="text-gray-700 mb-4">
            Defina aqui os dias e horários em que você normalmente está
            disponível para dar aulas. Os eventos da sua agenda conectada
            (Google Calendar) serão usados para bloquear horários ocupados
            automaticamente.
          </p>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <form className="space-y-2">
              {weekDays.map((day, idx) => (
                <div key={day.value} className="flex items-center gap-2">
                  <label className="w-24 text-gray-700">{day.label}</label>
                  <input
                    type="time"
                    value={workSchedule[idx].startTime}
                    onChange={(e) =>
                      handleChange(idx, "startTime", e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  />
                  <span>às</span>
                  <input
                    type="time"
                    value={workSchedule[idx].endTime}
                    onChange={(e) =>
                      handleChange(idx, "endTime", e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
              ))}
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-4"
              >
                {saving ? "Salvando..." : "Salvar horários"}
              </Button>
              {message && (
                <div className="text-sm mt-2 text-blue-700">{message}</div>
              )}
            </form>
          )}
        </div>
        {/* ...integração Google Calendar já existente... */}
        <div className="space-y-4">
          {isConnected ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-5xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Calendário Conectado!
              </h3>
              <p className="text-gray-600 mb-4">
                Sua agenda está sincronizada e os horários disponíveis são
                atualizados automaticamente.
              </p>
              <Button variant="outline" onClick={() => setIsConnected(false)}>
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conectar Google Calendar
              </h3>
              <p className="text-gray-600 mb-6">
                Conecte sua agenda para que os alunos vejam apenas seus horários
                realmente disponíveis.
              </p>
              <Button onClick={connectCalendar}>Conectar Agenda</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const IntegrationsSection = () => {
  const [zoomConnected, setZoomConnected] = useState(false);
  const [zoomData, setZoomData] = useState({
    email: "",
    password: "",
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleZoomConnect = async () => {
    // Validações
    if (!zoomData.email.trim()) {
      toast.error("E-mail do Zoom é obrigatório");
      return;
    }

    if (!validateEmail(zoomData.email)) {
      toast.error("E-mail do Zoom deve ter um formato válido");
      return;
    }

    if (!zoomData.password.trim()) {
      toast.error("Senha do Zoom é obrigatória");
      return;
    }

    if (!validatePassword(zoomData.password)) {
      toast.error("Senha do Zoom deve ter pelo menos 6 caracteres");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch("/api/zoom/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(zoomData),
      });

      if (response.ok) {
        setZoomConnected(true);
        toast.success("Zoom conectado com sucesso!");
      } else {
        const error = await response.json();
        toast.error(`Erro ao conectar Zoom: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao conectar Zoom:", error);
      toast.error("Erro ao conectar Zoom");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zoom Integration */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Zoom</h2>
          <div>
            {zoomConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    🎥
                  </div>
                  <div>
                    <p className="font-medium">Zoom conectado</p>
                    <p className="text-sm text-gray-600">
                      Links serão gerados automaticamente
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setZoomConnected(false)}
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail do Zoom *
                  </label>
                  <input
                    type="email"
                    value={zoomData.email}
                    onChange={(e) =>
                      setZoomData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="seu@zoom.com"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      zoomData.email && !validateEmail(zoomData.email)
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {zoomData.email && !validateEmail(zoomData.email) && (
                    <p className="text-sm text-red-600 mt-1">
                      E-mail deve ter um formato válido
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha do Zoom *
                  </label>
                  <input
                    type="password"
                    value={zoomData.password}
                    onChange={(e) =>
                      setZoomData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Sua senha do Zoom"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      zoomData.password && !validatePassword(zoomData.password)
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {zoomData.password &&
                    !validatePassword(zoomData.password) && (
                      <p className="text-sm text-red-600 mt-1">
                        Senha deve ter pelo menos 6 caracteres
                      </p>
                    )}
                </div>
                <Button
                  onClick={handleZoomConnect}
                  disabled={
                    isConnecting ||
                    !validateEmail(zoomData.email) ||
                    !validatePassword(zoomData.password)
                  }
                  className="w-full"
                >
                  {isConnecting ? "Conectando..." : "Conectar Zoom"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentsSection = () => {
  const [paymentConfig, setPaymentConfig] = useState({
    receiveViaStripe: false,
    stripeAccountId: "",
    receiveViaPayPal: false,
    paypalEmail: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const savePaymentConfig = async () => {
    if (!paymentConfig.receiveViaStripe && !paymentConfig.receiveViaPayPal) {
      toast.error("Selecione pelo menos uma forma de recebimento");
      return;
    }

    if (paymentConfig.receiveViaStripe && !paymentConfig.stripeAccountId) {
      toast.error("Informe o Stripe Account ID");
      return;
    }

    if (paymentConfig.receiveViaPayPal && !paymentConfig.paypalEmail) {
      toast.error("Informe o e-mail do PayPal");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/teachers/me/payment-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentConfig,
          isActive: true,
        }),
      });

      if (response.ok) {
        toast.success("Configuração de pagamento salva com sucesso!");
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          Configuração de Recebimento
        </h2>
        <p className="text-gray-600 mb-6">
          Configure como deseja receber os pagamentos dos alunos. A plataforma
          processará os pagamentos e repassará os valores para você
          automaticamente.
        </p>

        <div className="space-y-6">
          {/* Stripe Connect */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="receiveViaStripe"
                checked={paymentConfig.receiveViaStripe}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium">Receber via Stripe Connect</h3>
                <p className="text-sm text-gray-600">
                  Receba diretamente na sua conta Stripe
                </p>
              </div>
            </div>

            {paymentConfig.receiveViaStripe && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Account ID
                </label>
                <input
                  name="stripeAccountId"
                  value={paymentConfig.stripeAccountId}
                  onChange={handleInputChange}
                  placeholder="acct_xxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Encontre seu Account ID no dashboard do Stripe
                </p>
              </div>
            )}
          </div>

          {/* PayPal */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="receiveViaPayPal"
                checked={paymentConfig.receiveViaPayPal}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium">Receber via PayPal</h3>
                <p className="text-sm text-gray-600">
                  Receba diretamente na sua conta PayPal
                </p>
              </div>
            </div>

            {paymentConfig.receiveViaPayPal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail do PayPal
                </label>
                <input
                  name="paypalEmail"
                  type="email"
                  value={paymentConfig.paypalEmail}
                  onChange={handleInputChange}
                  placeholder="seu@paypal.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  E-mail da conta PayPal onde receberá os pagamentos
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Os alunos escolhem como querem pagar (cartão ou PayPal)</li>
              <li>• A plataforma processa o pagamento</li>
              <li>• O valor é repassado automaticamente para você</li>
              <li>• Você pode configurar múltiplas formas de recebimento</li>
            </ul>
          </div>

          <Button
            onClick={savePaymentConfig}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PublicLinkSection = () => {
  const [price, setPrice] = useState(150);
  const [currency, setCurrency] = useState("BRL");
  const [publicUrl, setPublicUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePublicLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/teachers/me/public-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price,
          currency,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPublicUrl(data.publicUrl);
        toast.success("Link público gerado com sucesso!");
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      toast.error("Erro ao gerar link público");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Gerar Link Público</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Aula
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Sobre os Pagamentos
            </h4>
            <p className="text-sm text-blue-700">
              Os alunos poderão escolher como querem pagar (cartão de crédito ou
              PayPal). A plataforma processará o pagamento e repassará o valor
              para você conforme sua configuração de recebimento.
            </p>
          </div>

          <Button
            onClick={generatePublicLink}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Gerando..." : "Gerar Link Público"}
          </Button>

          {publicUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">
                Link Público Ativo!
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-green-300 rounded-md bg-white text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Este é seu link único e fixo. Compartilhe com seus alunos para
                que eles possam agendar aulas diretamente.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
