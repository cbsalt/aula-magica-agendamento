
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, Mail, Video, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface PaymentData {
  email: string;
  date: string;
  time: string;
  price: number;
  paymentId: string;
  status: string;
  paidAt: string;
}

const Confirmation = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [zoomLink, setZoomLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('paymentData');
    if (!stored) {
      navigate('/');
      return;
    }
    
    const data = JSON.parse(stored);
    setPaymentData(data);
    
    // Simulate Zoom API call to generate meeting link
    generateZoomMeeting(data);
  }, [navigate]);

  const generateZoomMeeting = async (data: PaymentData) => {
    // Mock Zoom meeting creation - in production would use Zoom API
    const mockZoomLink = `https://zoom.us/j/123456789?pwd=example${Date.now()}`;
    setZoomLink(mockZoomLink);
    
    // Simulate sending email with meeting details
    sendConfirmationEmail(data, mockZoomLink);
  };

  const sendConfirmationEmail = (data: PaymentData, meetingLink: string) => {
    // Mock email sending - in production would use email service
    console.log('Sending confirmation email to:', data.email);
    console.log('Meeting details:', {
      date: data.date,
      time: data.time,
      zoomLink: meetingLink
    });
    
    toast({
      title: "E-mail enviado!",
      description: "Detalhes da aula foram enviados para seu e-mail",
    });
  };

  const handleAddToCalendar = () => {
    if (!paymentData) return;
    
    const startDate = new Date(paymentData.date);
    const [hours, minutes] = paymentData.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // 1 hour class
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Aula Particular&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=Link da reunião: ${zoomLink}&location=${zoomLink}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleJoinMeeting = () => {
    if (zoomLink) {
      window.open(zoomLink, '_blank');
    }
  };

  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-4">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-800">
            Aula Confirmada!
          </h1>
          <p className="text-gray-600">
            Seu pagamento foi processado com sucesso
          </p>
        </div>

        {/* Booking Details */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Detalhes da Sua Aula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium">{paymentData.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">{format(new Date(paymentData.date), "dd/MM/yyyy")}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="font-medium">{paymentData.time}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Valor Pago</p>
                  <p className="font-medium text-green-600">R$ {paymentData.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Link */}
        {zoomLink && (
          <Card className="shadow-xl border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-blue-800">
                <Video className="mr-2 h-5 w-5" />
                Link da Reunião Virtual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-2">Link da reunião Zoom:</p>
                <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                  {zoomLink}
                </p>
              </div>
              
              <Button
                onClick={handleJoinMeeting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Video className="mr-2 h-4 w-4" />
                Acessar Reunião
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleAddToCalendar}
            variant="outline"
            className="h-12"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ao Google Calendar
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            className="h-12 bg-emerald-600 hover:bg-emerald-700"
          >
            Agendar Nova Aula
          </Button>
        </div>

        {/* Payment Info */}
        <Card className="shadow-lg border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>ID do Pagamento: {paymentData.paymentId}</p>
              <p>Processado em: {format(new Date(paymentData.paidAt), "dd/MM/yyyy 'às' HH:mm")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;
