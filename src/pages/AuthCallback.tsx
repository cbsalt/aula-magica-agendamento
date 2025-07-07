
import React, { useEffect } from 'react';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          // In a real implementation, you would exchange the code for tokens on your backend
          // For now, we'll simulate a successful authentication
          const mockUser = {
            id: 'mock-user-id',
            name: 'Professor Exemplo',
            email: 'professor@exemplo.com',
            picture: 'https://via.placeholder.com/150',
            accessToken: 'mock-access-token'
          };
          
          localStorage.setItem('user', JSON.stringify(mockUser));
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Error handling auth callback:', error);
          window.location.href = '/dashboard';
        }
      } else {
        window.location.href = '/dashboard';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
