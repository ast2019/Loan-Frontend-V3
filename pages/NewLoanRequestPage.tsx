import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanApi, authApi } from '../services/apiClient';
import Stepper6 from '../components/Stepper6';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, UploadCloud } from 'lucide-react';
import { CreateLoanParams } from '../types';

const AMOUNTS = [30000000, 50000000, 100000000];
const TENORS = [12, 18, 24];

const NewLoanRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = authApi.getCurrentUser();
  
  // Guard: Check Terms Acceptance
  useEffect(() => {
    try {
      const accepted = localStorage.getItem('touran:termsAccepted') === 'true';
      if (!accepted) {
        navigate('/app/terms', { replace: true });
      }
    } catch (e) {
      navigate('/app/terms', { replace: true });
    }
  }, [navigate]);

  // Form States
  const [nationalId, setNationalId] = useState('');
  const [amount, setAmount] = useState<number>(50000000);
  const [tenor, setTenor] = useState<number>(12);
  const [branchSearch, setBranchSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  // Keeping checkboxes as explicit confirmation for the request, even though Step 2 is done
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedCheque, setAcceptedCheque] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data Fetching
  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: loanApi.getBranches });

  // Mutation
  const mutation = useMutation({
    mutationFn: loanApi.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoan'] });
      navigate('/app/request');
    },
    onError: (err: any) => {
      setErrors({ form: err.message || 'خطایی رخ داد' });
    }
  });

  const filteredBranches = branches?.filter(b => b.name.includes(branchSearch)) || [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (nationalId.length !== 10 || !/^\d+$/.test(nationalId)) newErrors.nationalId = "کد ملی باید ۱۰ رقم باشد";
    if (!selectedBranch) newErrors.branch = "لطفاً یک شعبه انتخاب کنید";
    if (!acceptedTerms) newErrors.terms = "تایید قوانین الزامی است";
    if (!acceptedCheque) newErrors.cheque = "تایید شرط چک برگشتی الزامی است";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const params: CreateLoanParams = {
      nationalId,
      amountToman: amount,
      tenorMonths: tenor,
      branchCode: selectedBranch,
      acceptedTerms,
      acceptedReturnedChequeRule: acceptedCheque
    };

    mutation.mutate(params);
  };

  return (
    <div className="space-y-8 pb-10">
      <Stepper6 currentStep={3} />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">تکمیل اطلاعات درخواست</h2>
        
        {errors.form && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">شماره موبایل</label>
              <input type="text" value={user?.mobile} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-left" dir="ltr" />
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">کد ملی <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all text-left dir-ltr ${errors.nationalId ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'}`}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                placeholder="0012345678"
              />
              {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">مبلغ وام (تومان) <span className="text-red-500">*</span></label>
              <select 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 bg-white"
              >
                {AMOUNTS.map(a => (
                  <option key={a} value={a}>{a.toLocaleString()} تومان</option>
                ))}
              </select>
            </div>

            {/* Tenor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">مدت بازپرداخت <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {TENORS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenor(t)}
                    className={`py-3 rounded-lg border text-sm font-bold transition-all ${tenor === t ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    {t} ماه
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Selection */}
          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">انتخاب شعبه بانک شهر <span className="text-red-500">*</span></label>
            <div className="relative mb-3">
              <Search className="absolute right-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="جستجوی نام شعبه..." 
                className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
              />
            </div>
            <div className="h-40 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-1">
              {filteredBranches.map(branch => (
                <div 
                  key={branch.code}
                  onClick={() => setSelectedBranch(branch.code)}
                  className={`p-3 rounded cursor-pointer text-sm flex justify-between items-center ${selectedBranch === branch.code ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white'}`}
                >
                  <span>{branch.name}</span>
                  <span className="text-xs text-slate-400">کد: {branch.code}</span>
                </div>
              ))}
              {filteredBranches.length === 0 && <div className="text-center text-slate-400 text-xs py-4">شعبه‌ای یافت نشد</div>}
            </div>
            {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
          </div>

          {/* Document Upload (Mock UI) */}
          <div className="border-t border-slate-100 pt-6">
             <label className="block text-sm font-medium text-slate-700 mb-2">بارگذاری مدارک (اختیاری)</label>
             <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <UploadCloud size={32} className="mb-2" />
                <span className="text-xs">برای آپلود کلیک کنید یا فایل را اینجا رها کنید</span>
             </div>
          </div>

          {/* Rules */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded" />
              <span className="text-sm text-slate-600">صحت اطلاعات وارد شده را تایید می‌کنم.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptedCheque} onChange={e => setAcceptedCheque(e.target.checked)} className="mt-1 w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded" />
              <span className="text-sm text-slate-600">می‌دانم که وجود چک برگشتی یا بدهی معوق بانکی مانع از دریافت وام خواهد شد.</span>
            </label>
            {(errors.terms || errors.cheque) && <p className="text-red-500 text-xs">تایید موارد بالا الزامی است.</p>}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primaryHover shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {mutation.isPending ? (
                 <><Loader2 className="animate-spin" /> در حال ثبت درخواست...</>
              ) : (
                 'ثبت درخواست و ادامه'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLoanRequestPage;