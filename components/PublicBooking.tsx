
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Card from './ui/Card'

interface Teacher {
  id: string
  name: string
  email: string
  photo?: string
  description?: string
  price: number
  currency: string
}

interface Props {
  teacher: Teacher
}

export default function PublicBooking({ teacher }: Props) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability()
    }
  }, [selectedDate])

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/teachers/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher.id,
          date: selectedDate,
        }),
      })
      
      if (response.ok) {
        const slots = await response.json()
        setAvailableSlots(slots)
      }
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !studentData.name || !studentData.email) {
      alert('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher.id,
          studentName: studentData.name,
          studentEmail: studentData.email,
          date: selectedDate,
          time: selectedTime,
          paymentMethod: 'stripe', // Default to Stripe
        }),
      })

      if (response.ok) {
        const { paymentUrl } = await response.json()
        window.open(paymentUrl, '_blank')
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Teacher Info */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4">
            {teacher.photo && (
              <img 
                src={teacher.photo} 
                alt={teacher.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
              {teacher.description && (
                <p className="text-gray-600 mt-2">{teacher.description}</p>
              )}
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {teacher.currency === 'BRL' ? 'R$' : '$'} {teacher.price.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Selecione Data e Horário</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horários Disponíveis
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTime(slot.start)}
                        className={`p-2 text-sm rounded border ${
                          selectedTime === slot.start
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={studentData.name}
                  onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={studentData.email}
                  onChange={(e) => setStudentData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                />
              </div>

              <Button
                onClick={handleBooking}
                loading={loading}
                disabled={!selectedDate || !selectedTime || !studentData.name || !studentData.email}
                className="w-full"
              >
                Agendar e Pagar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
