import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@#$%^&+=!]/, 'Password must contain at least one special character'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/register', data);
      toast.success('Registration successful! Please check your email for the code.');
      setRegisteredEmail(data.email);
      setShowVerification(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await apiClient.post('/auth/verify-email', { email: registeredEmail, code: verificationCode });
      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-10 w-10 text-[var(--color-accent)]" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="card mt-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  First name
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className={`input ${errors.firstName ? 'border-[var(--color-danger)]' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className={`input ${errors.lastName ? 'border-[var(--color-danger)]' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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
                type="password"
                {...register('password')}
                className={`input ${errors.password ? 'border-[var(--color-danger)]' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {showVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="card bg-[var(--color-bg-primary)] w-full max-w-sm p-8 text-center animate-scale-in">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Verify your email</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                We've emailed a 6-digit verification code to <strong>{registeredEmail}</strong>.
              </p>
              
              <form onSubmit={handleVerify} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium mb-1 text-center">Enter 6-digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="input w-full text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="btn btn-primary w-full"
                >
                  {isVerifying ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Verify Email'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
