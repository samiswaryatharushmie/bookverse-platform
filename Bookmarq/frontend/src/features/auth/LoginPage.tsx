import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { useAuth } from './context/AuthContext';
import { BookOpen, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState<'login' | '2fa' | 'forgot-password' | 'reset-password'>('login');
  const [emailFor2Fa, setEmailFor2Fa] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2Fa, setIsVerifying2Fa] = useState(false);
  
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/auth/login', data);
      
      if (res.data.data.requires2Fa) {
        setEmailFor2Fa(res.data.data.email);
        setStep('2fa');
        toast.success('Please check your email for the verification code.');
        return;
      }

      const { accessToken } = res.data.data;
      
      // Fetch user profile immediately after login
      const userRes = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      login(accessToken, userRes.data.data);
      toast.success('Welcome back!');
      // Redirect staff/admin to staff dashboard
      const userRoles = userRes.data.data.roles || [];
      if (userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_STAFF')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode) return;
    setIsVerifying2Fa(true);
    try {
      const res = await apiClient.post('/auth/verify-2fa', { email: emailFor2Fa, code: twoFactorCode });
      const { accessToken } = res.data.data;
      
      const userRes = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      login(accessToken, userRes.data.data);
      toast.success('Welcome back!');
      // Redirect staff/admin to staff dashboard
      const userRoles = userRes.data.data.roles || [];
      if (userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_STAFF')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsVerifying2Fa(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsResetting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: resetEmail });
      toast.success('If an account exists for that email, a reset code has been sent. Check your inbox.');
      setStep('reset-password');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) return;
    setIsResetting(true);
    try {
      await apiClient.post('/auth/reset-password', { token: resetCode, newPassword });
      toast.success('Password reset successfully! Please log in.');
      setStep('login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-10 w-10 text-[var(--color-accent)]" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]">
              Register here
            </Link>
          </p>
        </div>

        {step === 'login' ? (
          <div className="card mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`input ${errors.email ? 'border-[var(--color-danger)]' : ''}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`input ${errors.password ? 'border-[var(--color-danger)]' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password.message}</p>
                )}
                
                <div className="mt-3 flex items-center">
                  <input
                    id="show-password"
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <label htmlFor="show-password" className="ml-2 block text-sm text-[var(--color-text-muted)] cursor-pointer select-none">
                    Show Password
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-2.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep('forgot-password')}
                  className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </div>
        ) : step === '2fa' ? (
          <div className="card mt-8 animate-fade-in">
            <form className="space-y-6" onSubmit={handleVerify2Fa}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Two-Factor Authentication</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Enter the 6-digit verification code sent to your email.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="input text-center text-2xl tracking-[0.5em] font-mono py-3"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying2Fa || twoFactorCode.length !== 6}
                className="btn btn-primary w-full py-2.5"
              >
                {isVerifying2Fa ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('login')}
                className="btn btn-secondary w-full py-2.5 mt-3"
              >
                Back to Login
              </button>
            </form>
          </div>
        ) : step === 'forgot-password' ? (
          <div className="card mt-8 animate-fade-in">
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Reset Password</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Enter your email address to receive a 6-digit reset code.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input w-full"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button type="submit" disabled={isResetting || !resetEmail} className="btn btn-primary w-full py-2.5">
                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : 'Send Reset Code'}
              </button>
              <button type="button" onClick={() => setStep('login')} className="btn btn-secondary w-full py-2.5 mt-3">
                Back to Login
              </button>
            </form>
          </div>
        ) : (
          <div className="card mt-8 animate-fade-in">
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Enter Reset Code</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Enter the 6-digit code and your new password.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1 text-center">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  className="input text-center text-2xl tracking-[0.5em] font-mono py-3"
                  placeholder="000000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input w-full"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" disabled={isResetting || resetCode.length !== 6 || !newPassword} className="btn btn-primary w-full py-2.5">
                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep('login')} className="btn btn-secondary w-full py-2.5 mt-3">
                Back to Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
