import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pill, Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoAdmin, loginAsDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsDemoAdmin();
      navigate('/admin');
    } catch (err: any) {
      setServerError(err.message || 'Demo admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoUser = async () => {
    setIsSubmitting(true);
    try {
      await loginAsDemoUser();
      navigate('/favorites');
    } catch (err: any) {
      setServerError(err.message || 'Demo user login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-in">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Pill className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your saved medicines and search history
          </p>
        </div>

        {/* Quick Demo Logins for Hackathon Evaluators */}
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Instant One-Click Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoAdmin}
              disabled={isSubmitting}
              className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-200 rounded-xl transition-colors text-center"
            >
              Demo Admin (Full CRUD)
            </button>
            <button
              type="button"
              onClick={handleDemoUser}
              disabled={isSubmitting}
              className="px-3 py-2 text-xs font-bold text-teal-800 bg-teal-100/80 hover:bg-teal-200 dark:bg-teal-900/60 dark:text-teal-200 rounded-xl transition-colors text-center"
            >
              Demo User (Saved Items)
            </button>
          </div>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. user@medicompare.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {errors.email && <p className="text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {errors.password && <p className="text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
