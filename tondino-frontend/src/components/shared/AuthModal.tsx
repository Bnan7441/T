import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { useError } from '@/context/ErrorContext';
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { authAPI } from '@/services/api';
import { enhancedAuthAPI } from '@/services/enhancedAPI';
import { loginSchema, registerSchema } from '@/validation/schemas';
import FormError from '@/components/shared/FormError';
import Icon from '../Icon';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, activePage } = useUI();
  const { login } = useAuth();
  const { loadGoogleGSI } = useAuth();
  const { logError, showError } = useError();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // React Hook Form with Zod validation - using union type for flexibility
  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(mode === 'signin' ? loginSchema : registerSchema)
  });

  // Reset form when switching modes
  useEffect(() => {
    reset();
  }, [mode, reset]);

  const handleAuth = async (formData: any) => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await authAPI.login(formData.email, formData.password);

        // اگر کاربر در صفحات اصلی بود، به داشبورد برود
        const target = (activePage === 'home' || activePage === 'about') ? 'dashboard' : undefined;
        await login(target);
        setIsAuthModalOpen(false);

        // Reset form
        reset();
      } else {
        await authAPI.register(formData.email, formData.password, formData.name);

        await login('dashboard');
        setIsAuthModalOpen(false);

        // Reset form
        reset();
      }
    } catch (err: any) {
      logError(err, 'auth');
      setError('خطا در ورود/ثبت نام');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setError('Google OAuth is not configured');
      return;
    }

    setLoading(true);
    setError('');

    // Initialize Google Sign-In
    if (typeof window.google !== 'undefined') {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      
      window.google.accounts.id.prompt(); // Show One Tap dialog
    } else {
      // try to load script on demand
      try {
        await loadGoogleGSI();
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCallback });
          (window as any).google.accounts.id.prompt();
        } else {
          setError('Google Sign-In library not loaded');
        }
      } catch (err) {
        setError('Failed to load Google Sign-In');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      await authAPI.googleLogin(response.credential);

      await login('dashboard');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      logError(err, 'auth');
      setError('خطا در ورود با گوگل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
      <div data-testid="auth-modal" className="p-8 md:p-10 space-y-8 text-right">

        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
              <span className="text-white font-black text-2xl italic">T</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-brand-primary dark:text-white">
                {mode === 'signin' ? 'خوش آمدید' : 'ساخت حساب کاربری'}
              </h2>
              <p className="text-sm text-gray-400 font-bold mt-1">
                {mode === 'signin' ? 'وارد حساب تندینو خود شوید' : 'به جمع خانواده تندینو بپیوندید'}
              </p>
            </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <Input
                  label="نام و نام خانوادگی"
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  autoComplete="name"
                  {...register('name')}
                />
                {errors.name && <FormError message={errors.name.message as string} />}
              </div>
            )}
            <div>
              <Input
                label="ایمیل"
                type="email"
                placeholder="example@gmail.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && <FormError message={errors.email.message as string} />}
            </div>
            <div>
              <Input
                label="رمز عبور"
                type="password"
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                {...register('password')}
              />
              {errors.password && <FormError message={errors.password.message as string} />}
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full py-4 rounded-xl shadow-glow text-lg font-black"
              disabled={loading}
            >
                {loading ? 'در حال پردازش...' : (mode === 'signin' ? 'ورود به حساب' : 'تایید و ثبت نام')}
            </Button>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-white/5"></div></div>
            <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-900 px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">یا ورود با</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-3 py-4 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <Icon fa="fa-google" className="text-red-500 text-lg" />
              <span className="text-sm font-bold dark:text-white">گوگل</span>
            </button>
            <button
              disabled={true}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 dark:border-white/5 opacity-50 cursor-not-allowed"
              title="Apple Sign-In coming soon"
            >
              <Icon fa="fa-apple" className="text-gray-900 dark:text-white" />
              <span className="text-xs font-bold dark:text-white">اپل</span>
            </button>
        </div>

        <p className="text-center text-xs font-bold text-gray-400">
            {mode === 'signin' ? 'هنوز عضو نشده‌اید؟ ' : 'قبلاً عضو شده‌اید؟ '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-brand-accent hover:underline"
            >
              {mode === 'signin' ? 'ایجاد حساب جدید' : 'وارد شوید'}
            </button>
        </p>

      </div>
    </Modal>
  );
};

export default AuthModal;
