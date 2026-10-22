import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/common/ErrorBanner';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(1, t('auth.requiredPassword')),
  });

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Never keep a rejected password in the form state or the DOM.
      resetField('password');
      setShowPassword(false);
      setServerError(err?.response?.status === 401 ? t('auth.invalidCredentials') : t('auth.invalidLogin'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded border border-line bg-white p-5 shadow-sm">
      <ErrorBanner message={serverError} />

      <Field label={t('auth.email')} error={errors.email?.message}>
        <TextInput type="email" autoComplete="username" placeholder={t('auth.emailPlaceholder')} {...register('email')} />
      </Field>

      <Field label={t('auth.password')} error={errors.password?.message}>
        <div className="relative">
          <TextInput
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('auth.passwordPlaceholder')}
            className="pe-9"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 end-0 flex items-center px-2.5 text-muted hover:text-ink"
            title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        <LogIn className="size-4" />
        {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </form>
  );
}
