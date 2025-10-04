import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { exchangeCodeForSessionToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/');
      } catch (error) {
        console.error('Erro na autenticação:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-dark)] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg text-[var(--primary-dark)]">Finalizando login...</p>
      </div>
    </div>
  );
}
