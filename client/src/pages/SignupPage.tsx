import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pill, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const signupFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
    city: z.string().trim().optional(),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').or(z.literal('')).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupFormSchema>;

export const SignupPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await authRegister(data);
      navigate('/');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Pill className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create an Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join MediCompare to save medicines and track local price movements
          </p>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Priya Patel"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {errors.name && <p className="text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. priya@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {errors.email && <p className="text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">City</label>
              <input
                type="text"
                {...register('city')}
                placeholder="e.g. Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
              <input
                type="text"
                maxLength={6}
                {...register('pincode')}
                placeholder="e.g. 560001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
              {errors.pincode && <p className="text-rose-500 mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Password (min 8 chars)</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Create a strong password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {errors.password && <p className="text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {errors.confirmPassword && <p className="text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
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
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
