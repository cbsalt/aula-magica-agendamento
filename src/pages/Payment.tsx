
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import LanguageSelector from '@/components/LanguageSelector';
import PaymentMethodSelector, { PaymentMethod } from '@/components/PaymentMethodSelector';
import CardPaymentForm from '@/components/PaymentForms/CardPaymentForm';
import PaypalPaymentForm from '@/components/PaymentForms/PaypalPaymentForm';
import PayoneerPaymentForm from '@/components/PaymentForms/PayoneerPaymentForm';
import { CardFormData, PaypalFormData, PayoneerFormData } from '@/lib/validation';

interface BookingData {
  email: string;
  name?: string;
  date: string;
  time: string;
  price: number;
}

const Payment = () => {
  const { t } = useTranslation();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentData, setPaymentData] = useState<CardFormData | PaypalFormData | PayoneerFormData | null>(null);
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('bookingData');
    if (!stored) {
      navigate('/');
      return;
    }
    setBookingData(JSON.parse(stored));
  }, [navigate]);

  // Reset payment validation when method changes
  useEffect(() => {
    setIsPaymentValid(false);
    setPaymentData(null);
  }, [paymentMethod]);

  const handlePaymentValidation = (
    isValid: boolean, 
    data?: CardFormData | PaypalFormData | PayoneerFormData
  ) => {
    setIsPaymentValid(isValid);
    setPaymentData(data || null);
  };

  const handlePayment = async () => {
    if (!isPaymentValid || !paymentData) {
      toast({
        title: t('payment.incompleteData'),
        description: t('payment.fillCardData'),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing based on method
    setTimeout(() => {
      const paymentResult = {
        ...bookingData,
        paymentMethod,
        paymentData,
        paymentId: `${paymentMethod}_${Date.now()}`,
        status: 'confirmed',
        paidAt: new Date().toISOString()
      };
      
      localStorage.setItem('paymentData', JSON.stringify(paymentResult));
      setIsProcessing(false);
      navigate('/confirmation');
    }, 3000);
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <CardPaymentForm 
            onValidationChange={handlePaymentValidation}
          />
        );
      case 'paypal':
        return (
          <PaypalPaymentForm 
            onValidationChange={handlePaymentValidation}
          />
        );
      case 'payoneer':
        return (
          <PayoneerPaymentForm 
            onValidationChange={handlePaymentValidation}
          />
        );
      default:
        return null;
    }
  };

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card className="shadow-xl h-fit">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Calendar className="mr-2 h-5 w-5" />
                {t('payment.summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{bookingData.email}</span>
              </div>
              {bookingData.name && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-medium">{bookingData.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(bookingData.date), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{bookingData.time}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-xl font-bold">
                <span>{t('payment.total')}</span>
                <span className="text-green-600">R$ {bookingData.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">
                {t('payment.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selector */}
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              {/* Payment Form */}
              {renderPaymentForm()}

              <div className="pt-4 space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !isPaymentValid}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg disabled:opacity-50"
                >
                  {isProcessing ? t('payment.processing') : `${t('payment.pay')} R$ ${bookingData.price.toFixed(2)}`}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('payment.back')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
