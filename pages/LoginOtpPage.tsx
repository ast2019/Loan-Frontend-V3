import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stepper6 from '../components/Stepper6';
import { authApi } from '../services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Edit2, CheckCircle2 } from 'lucide-react';

const LoginOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile;

  useEffect(() => {
    if (!mobile) navigate('/auth/login', { replace: true });
  }, [mobile, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const loginMutation = useMutation({
    mutationFn: (otpCode: string) => authApi.verifyOtp(mobile, otpCode),
    onSuccess: () => {
      // Step 1 Complete -> Go to Step 2 (Terms)
      navigate('/app/terms', { replace: true });
    },
    onError: (err: any) => {
      setError(err.message || "کد وارد شده صحیح نمی‌باشد.");
    }
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.requestOtp(mobile),
    onSuccess: () => {
      setTimer(60);
      setResendSuccess('کد تایید مجدد ارسال شد.');
      setError('');
      setTimeout(() => setResendSuccess(''), 3000);
    },
    onError: () => {
      setError('خطا در ارسال مجدد کد. لطفاً لحظاتی دیگر تلاش کنید.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 5) return;
    loginMutation.mutate(otp);
  };

  const handleResend = () => {
    if (timer === 0) {
      resendMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <Stepper6 currentStep={1} />
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">تایید شماره موبایل</h2>
        <div className="flex items-center justify-between text-slate-500 mb-6 text-sm bg-slate-50 p-3 rounded-lg">
           <span>کد ارسال شده به {mobile}</span>
           <button onClick={() => navigate('/auth/login')} className="text-primary flex items-center gap-1 hover:underline">
             <Edit2 size={14} /> اصلاح
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">کد ۵ رقمی (پیش‌فرض: 12345)</label>
            <input 
              type="text" 
              dir="ltr"
              maxLength={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center text-2xl tracking-[0.5em] font-bold"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              disabled={loginMutation.isPending}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            {resendSuccess && (
              <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> {resendSuccess}
              </p>
            )}
          </div>

          <div className="text-center text-sm">
             {timer > 0 ? (
                 <span className="text-slate-400">ارسال مجدد کد تا {timer} ثانیه دیگر</span>
             ) : (
                 <button 
                   type="button" 
                   onClick={handleResend} 
                   disabled={resendMutation.isPending}
                   className="text-primary font-bold hover:underline disabled:opacity-50"
                 >
                   {resendMutation.isPending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                 </button>
             )}
          </div>

          <button 
            type="submit"
            disabled={loginMutation.isPending || otp.length < 5}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loginMutation.isPending ? <Loader2 className="animate-spin" /> : 'تایید و ورود'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginOtpPage;