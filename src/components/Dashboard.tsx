'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'calendar', label: 'Calendário', icon: '📅' },
    { id: 'integrations', label: 'Integrações', icon: '🔗' },
    { id: 'payments', label: 'Pagamentos', icon: '💳' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
                  alt={session.user.name || ''}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">{session?.user?.name}</span>
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
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
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
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'calendar' && <CalendarSection />}
            {activeTab === 'integrations' && <IntegrationsSection />}
            {activeTab === 'payments' && <PaymentsSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileSection = () => {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
    price: '',
    currency: 'BRL',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = () => {
    // Save profile data
    console.log('Saving profile:', formData)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Dados do Perfil</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
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
  )
}

const CalendarSection = () => {
  const [isConnected, setIsConnected] = useState(false)

  const connectCalendar = async () => {
    const token = localStorage.getItem('google_access_token')
    if (!token) return

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await res.json()
    console.log('Calendários conectados:', data)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Integração com Google Calendar</h2>
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
  )
}

const IntegrationsSection = () => {
  const [zoomConnected, setZoomConnected] = useState(false)
  const [meetLink, setMeetLink] = useState('')

  const handleZoomConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID
    const redirectUri = `${window.location.origin}/zoom/callback`
    const state = crypto.randomUUID()
    sessionStorage.setItem('zoom_oauth_state', state)

    const zoomAuthUrl =
      `https://zoom.us/oauth/authorize?` +
      `response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`

    window.location.href = zoomAuthUrl
  }

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
                <Button variant="outline" onClick={() => setZoomConnected(false)}>
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  Conecte sua conta Zoom para gerar links automaticamente
                </p>
                <Button onClick={handleZoomConnect}>Conectar Zoom</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const PaymentsSection = () => {
  const [selectedMethod, setSelectedMethod] = useState('')
  const [paymentData, setPaymentData] = useState({
    stripeAccountId: '',
    paypalEmail: '',
    payoneerEmail: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const savePaymentMethod = () => {
    console.log('Saving payment method:', { selectedMethod, paymentData })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Método de Recebimento</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Escolha como deseja receber os pagamentos:
            </label>
            <div className="space-y-3">
              {[
                { id: 'stripe', label: 'Stripe Connect', icon: '💳' },
                { id: 'paypal', label: 'PayPal', icon: '🏦' },
                { id: 'payoneer', label: 'Payoneer', icon: '💰' },
              ].map((method) => (
                <label
                  key={method.id}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="mr-2">{method.icon}</span>
                  {method.label}
                </label>
              ))}
            </div>
          </div>

          {selectedMethod === 'stripe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Account ID
              </label>
              <input
                name="stripeAccountId"
                value={paymentData.stripeAccountId}
                onChange={handleInputChange}
                placeholder="acct_xxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {selectedMethod === 'paypal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail do PayPal
              </label>
              <input
                name="paypalEmail"
                type="email"
                value={paymentData.paypalEmail}
                onChange={handleInputChange}
                placeholder="seu@paypal.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {selectedMethod === 'payoneer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail do Payoneer
              </label>
              <input
                name="payoneerEmail"
                type="email"
                value={paymentData.payoneerEmail}
                onChange={handleInputChange}
                placeholder="seu@payoneer.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {selectedMethod && (
            <Button onClick={savePaymentMethod}>Salvar Configuração</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
