
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Clock, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BookingData {
  email: string;
  date: string;
  time: string;
  price: number;
}

const Payment = () => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
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

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os dados do cartão",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        ...bookingData,
        paymentId: `payment_${Date.now()}`,
        status: 'confirmed',
        paidAt: new Date().toISOString()
      };
      
      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      setIsProcessing(false);
      navigate('/confirmation');
    }, 3000);
  };

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Booking Summary */}
        <Card className="shadow-xl h-fit">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-800">
              <Calendar className="mr-2 h-5 w-5" />
              Resumo da Aula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{bookingData.email}</span>
            </div>
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
              <span>Total:</span>
              <span className="text-green-600">R$ {bookingData.price.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-800">
              <CreditCard className="mr-2 h-5 w-5" />
              Dados de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="Nome como impresso no cartão"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                  setCardNumber(formatted);
                }}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={(e) => {
                    const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                    setExpiryDate(formatted);
                  }}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
              >
                {isProcessing ? 'Processando...' : `Pagar R$ ${bookingData.price.toFixed(2)}`}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
