
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/pure/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/pure/Card';
import { Teacher } from '@/types/teacher';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);

  useEffect(() => {
    // Check if teacher is logged in
    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      setTeacher(JSON.parse(storedTeacher));
    }
  }, []);

  const handleGoogleAuth = async () => {
    setIsConnectingCalendar(true);
    
    // Google OAuth2 flow
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  const generateTeacherLink = () => {
    if (!teacher) return '';
    return `${window.location.origin}/aula/${teacher.id}`;
  };

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('teacher.login')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {/* Implement login */}} className="w-full">
              {t('teacher.loginWithGoogle')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {t('teacher.dashboard')} - {teacher.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle>{t('teacher.calendarIntegration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teacher.googleAccessToken ? (
                <div className="text-green-600">
                  ✅ {t('teacher.calendarConnected')}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    {t('teacher.calendarDescription')}
                  </p>
                  <Button 
                    onClick={handleGoogleAuth}
                    loading={isConnectingCalendar}
                  >
                    {t('teacher.connectCalendar')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Public Link */}
          <Card>
            <CardHeader>
              <CardTitle>{t('teacher.publicLink')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {t('teacher.publicLinkDescription')}
              </p>
              <div className="bg-gray-100 p-3 rounded-md">
                <code className="text-sm">{generateTeacherLink()}</code>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(generateTeacherLink())}
              >
                {t('teacher.copyLink')}
              </Button>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('teacher.recentBookings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{t('teacher.noBookings')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
