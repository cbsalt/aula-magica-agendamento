
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/pure/Button';
import Input from '@/components/pure/Input';
import Select from '@/components/pure/Select';
import Calendar from '@/components/pure/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/pure/Card';
import { Teacher, TimeSlot } from '@/types/teacher';
import { GoogleCalendarService } from '@/services/googleCalendar';
import { bookingSchema, BookingFormData } from '@/lib/validation';
import { format } from 'date-fns';

const PublicBooking = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange'
  });

  const selectedTime = watch('time');

  useEffect(() => {
    // Load teacher data
    const loadTeacher = async () => {
      // In a real app, this would be an API call
      const mockTeacher: Teacher = {
        id: teacherId || '1',
        name: 'Professor João',
        email: 'joao@example.com',
        photo: 'https://via.placeholder.com/150',
        description: 'Professor de inglês com 10 anos de experiência',
        price: 150,
        currency: 'BRL',
        googleCalendarId: 'primary',
        googleAccessToken: 'mock-token',
        googleRefreshToken: 'mock-refresh',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTeacher(mockTeacher);
    };

    if (teacherId) {
      loadTeacher();
    }
  }, [teacherId]);

  useEffect(() => {
    if (selectedDate && teacher?.googleAccessToken) {
      loadAvailableSlots();
    }
  }, [selectedDate, teacher]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !teacher) return;

    setIsLoadingSlots(true);
    try {
      const calendarService = new GoogleCalendarService(teacher.googleAccessToken!);
      
      const timeMin = new Date(selectedDate);
      timeMin.setHours(0, 0, 0, 0);
      
      const timeMax = new Date(selectedDate);
      timeMax.setHours(23, 59, 59, 999);

      const freeBusyResponse = await calendarService.getFreeBusy(
        teacher.googleCalendarId || 'primary',
        timeMin.toISOString(),
        timeMax.toISOString()
      );

      const busyTimes = freeBusyResponse.calendars[teacher.googleCalendarId || 'primary']?.busy || [];
      const slots = calendarService.generateTimeSlots(selectedDate, busyTimes);
      
      setAvailableSlots(slots.filter(slot => slot.available));
    } catch (error) {
      console.error('Failed to load available slots:', error);
      // Fallback to mock data
      setAvailableSlots([
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '14:00', end: '15:00', available: true },
        { start: '15:00', end: '16:00', available: true },
      ]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const onSubmit = (data: BookingFormData) => {
    // Store booking data and navigate to payment
    const bookingData = {
      teacherId: teacher?.id,
      teacherName: teacher?.name,
      studentEmail: data.email,
      studentName: data.name,
      date: data.date.toISOString(),
      time: data.time,
      price: teacher?.price || 150,
      currency: teacher?.currency || 'BRL'
    };
    
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    window.location.href = '/payment';
  };

  const timeOptions = availableSlots.map(slot => ({
    value: slot.start,
    label: `${slot.start} - ${slot.end}`,
    disabled: false
  }));

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Teacher Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        {/* Booking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('booking.selectDateTime')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Calendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
              />
              
              {selectedDate && (
                <Select
                  label={t('booking.availableTimes')}
                  options={timeOptions}
                  value={selectedTime}
                  placeholder={isLoadingSlots ? t('booking.loadingTimes') : t('booking.selectTime')}
                  disabled={isLoadingSlots || timeOptions.length === 0}
                  onChange={(value) => setValue('time', value, { shouldValidate: true })}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('booking.studentInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label={t('booking.email')}
                  type="email"
                  placeholder={t('booking.emailPlaceholder')}
                  error={errors.email?.message ? t(errors.email.message) : undefined}
                  {...register('email')}
                />

                <Input
                  label={t('booking.name')}
                  placeholder={t('booking.namePlaceholder')}
                  error={errors.name?.message ? t(errors.name.message) : undefined}
                  {...register('name')}
                />

                {/* Hidden fields for date validation */}
                <input type="hidden" {...register('date')} />
                <input type="hidden" {...register('time')} />

                <Button
                  type="submit"
                  disabled={!isValid || !selectedDate || !selectedTime}
                  className="w-full"
                >
                  {t('booking.continueToPayment')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
