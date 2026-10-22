import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../features/auth/LoginForm';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <AuthLayout>
      <LoginForm />
      <p className="mt-4 text-center">
        <Link to="/demo" className="text-sm text-primary hover:underline">
          {t('auth.tryDemo')}
        </Link>
      </p>
    </AuthLayout>
  );
}
