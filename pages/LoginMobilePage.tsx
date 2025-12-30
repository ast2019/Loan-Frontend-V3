import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Stepper6 from '../components/Stepper6';
import { authApi } from '../services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const LoginMobilePage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const mutation = useMutation({
    mutationFn: authApi.requestOtp,
    onSuccess: () => {
      history.push('/auth/otp', { mobile });
    },
    onError: () => {
      setError("خطایی در ارسال کد رخ داد. لطفاً مجدد تلاش کنید.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const mobileRegex = /^09[0-9]{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError("لطفاً شماره موبایل معتبر وارد کنید (مثال: 09121234567)");
      return;
    }

    mutation.mutate(mobile);
  };

  return (
    <div className="space-y-6">
      <Stepper6 currentStep={1} />
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">ورود / ثبت‌نام</h2>
        <p className="text-slate-500 mb-6 text-sm">برای ورود به سامانه، شماره موبایل خود را وارد کنید.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">شماره موبایل</label>
            <input 
              type="tel" 
              dir="ltr"
              placeholder="09xxxxxxxxx"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center text-lg tracking-widest"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
              disabled={mutation.isPending}
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <button 
            type="submit"
            disabled={mutation.isPending || mobile.length < 11}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : 'ارسال کد تایید'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginMobilePage;