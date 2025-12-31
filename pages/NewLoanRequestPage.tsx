import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanApi, authApi, safeStorage } from '../services/apiClient';
import Stepper6 from '../components/Stepper6';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, UploadCloud } from 'lucide-react';
import { CreateLoanParams } from '../types';

const MIN_AMOUNT = 5_000_000;
const MAX_AMOUNT = 200_000_000;
const STEP_AMOUNT = 1_000_000;
const QUICK_AMOUNTS = [10_000_000, 20_000_000, 50_000_000, 100_000_000];
const TENORS = [6, 12, 18, 24];

const NewLoanRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = authApi.getCurrentUser();
  
  // Guard: Check Terms Acceptance
  useEffect(() => {
    const accepted = safeStorage.getItem('touran:termsAccepted') === 'true';
    if (!accepted) {
      navigate('/app/terms', { replace: true });
    }
  }, [navigate]);

  // Form States
  const [nationalId, setNationalId] = useState('');
  const [amount, setAmount] = useState<number>(50_000_000);
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
    
    // Validate National ID
    if (!nationalId) {
        newErrors.nationalId = "لطفاً کد ملی را وارد کنید.";
    } else if (!/^\d{10}$/.test(nationalId)) {
        newErrors.nationalId = "کد ملی باید دقیقاً ۱۰ رقم عددی باشد.";
    }

    // Validate Branch
    if (!selectedBranch) newErrors.branch = "لطفاً یک شعبه را از لیست انتخاب کنید.";

    // Validate Checkboxes
    if (!acceptedTerms) newErrors.terms = "برای ثبت درخواست، تایید صحت اطلاعات الزامی است.";
    if (!acceptedCheque) newErrors.cheque = "تایید شرط عدم چک برگشتی الزامی است.";
    
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

  // Logic to handle Amount Input (Manual Entry)
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, '');
    if (!rawVal) {
        setAmount(MIN_AMOUNT);
        return;
    }
    if (/^\d+$/.test(rawVal)) {
        let val = parseInt(rawVal, 10);
        if (val > MAX_AMOUNT) val = MAX_AMOUNT;
        setAmount(val);
    }
  };

  const handleAmountInputBlur = () => {
      if (amount < MIN_AMOUNT) setAmount(MIN_AMOUNT);
      if (amount > MAX_AMOUNT) setAmount(MAX_AMOUNT);
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

            {/* Amount Slider & Input Combined */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-4">مبلغ وام درخواستی <span className="text-red-500">*</span></label>
              
              <div className="flex flex-col gap-6">
                 {/* Top Row: Slider value display / Input */}
                 <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input 
                          type="text" 
                          className="w-full pl-16 pr-4 py-3 text-lg font-bold text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-left dir-ltr"
                          value={amount.toLocaleString()}
                          onChange={handleAmountInputChange}
                          onBlur={handleAmountInputBlur}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">تومان</span>
                    </div>
                 </div>

                 {/* Middle Row: Slider */}
                 <div className="px-2">
                    <input 
                        type="range" 
                        min={MIN_AMOUNT} 
                        max={MAX_AMOUNT} 
                        step={STEP_AMOUNT}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                        <span>{MIN_AMOUNT.toLocaleString()}</span>
                        <span>{MAX_AMOUNT.toLocaleString()}</span>
                    </div>
                 </div>

                 {/* Bottom Row: Quick Chips */}
                 <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${amount === val ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                           {(val / 1000000).toLocaleString()} میلیون تومان
                        </button>
                    ))}
                 </div>
              </div>
            </div>

            {/* Tenor */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">مدت بازپرداخت <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-4 gap-3">
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