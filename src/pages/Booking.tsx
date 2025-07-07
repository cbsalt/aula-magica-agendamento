
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';

const Booking = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const navigate = useNavigate();

  // Mock available times - in production would come from Google Calendar API
  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleBooking = () => {
    if (!email || !selectedDate || !selectedTime) {
      toast({
        title: t('booking.requiredFields'),
        description: t('booking.fillAllFields'),
        variant: "destructive"
      });
      return;
    }

    // Store booking data for next page
    const bookingData = {
      email,
      date: selectedDate.toISOString(),
      time: selectedTime,
      price: 150.00 // Mock price - would come from teacher profile
    };
    
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              {t('booking.title')}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {t('booking.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('booking.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('booking.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>{t('booking.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : t('booking.datePlaceholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selector */}
            <div className="space-y-2">
              <Label>{t('booking.time')}</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('booking.timePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Display */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t('booking.price')}</span>
                <span className="text-2xl font-bold text-blue-600">R$ 150,00</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleBooking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              {t('booking.continueToPayment')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
