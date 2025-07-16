
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
import { CardFormData, PaypalFormData } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';

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
  const [paymentData, setPaymentData] = useState<CardFormData | PaypalFormData | null>(null);
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
    data?: CardFormData | PaypalFormData
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
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{bookingData.email}</span>
                </div>
                {bookingData.name && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="font-medium">{bookingData.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-emerald-600 text-white px-3 py-2 text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {format(new Date(bookingData.date), "dd/MM/yyyy")} às {bookingData.time}
                  </Badge>
                </div>
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
              <div className="transition-all duration-300">
                {renderPaymentForm()}
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !isPaymentValid}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      {t('payment.processing')}
                    </span>
                  ) : `${t('payment.pay')} R$ ${bookingData.price.toFixed(2)}`}
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
