
'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('landing.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto">
                {t('landing.startAsTeacher')}
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t('landing.learnMore')}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              📅
            </div>
            <h3 className="text-xl font-semibold mb-2">Agendamento Inteligente</h3>
            <p className="text-gray-600">
              Conecte seu Google Calendar e deixe os alunos verem apenas seus horários livres.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              💳
            </div>
            <h3 className="text-xl font-semibold mb-2">Pagamentos Automáticos</h3>
            <p className="text-gray-600">
              Receba pagamentos via Stripe, PayPal ou Payoneer de forma segura e automática.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              🎥
            </div>
            <h3 className="text-xl font-semibold mb-2">Aulas Online</h3>
            <p className="text-gray-600">
              Integração com Zoom para criar links de reunião automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
