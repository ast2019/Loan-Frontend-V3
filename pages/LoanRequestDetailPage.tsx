import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loanApi } from '../services/apiClient';
import Stepper6 from '../components/Stepper6';
import { LoanStatus } from '../types';
import { Loader2, Download, RefreshCw, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';

// Safe local helper for component-specific storage
const getStoredFlag = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) === 'true';
    }
  } catch (e) {
    // Ignore error
  }
  return false;
};

const setStoredFlag = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    // Ignore error
  }
};

const LoanRequestDetailPage: React.FC = () => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isLetterDownloaded, setIsLetterDownloaded] = useState(false);

  const { data: loan, isLoading, refetch } = useQuery({
    queryKey: ['activeLoan'],
    queryFn: loanApi.getActiveLoan,
    refetchInterval: (query) => {
        const data = query.state.data;
        // Poll frequently if in transient states
        if (!data) return false;
        if (data.status === LoanStatus.IdentityCheck) return 2000;
        if (data.status === LoanStatus.WaitingForLetter) return 5000;
        if (data.status === LoanStatus.WaitingForBankApproval) return 5000;
        return false;
    }
  });

  // Check LocalStorage for download flag on mount/update
  useEffect(() => {
    if (loan) {
      if (getStoredFlag(`loan:${loan.id}:letterDownloaded`)) {
        setIsLetterDownloaded(true);
      }
    }
  }, [loan]);

  const handleDownload = async () => {
    if (!loan) return;
    setDownloadLoading(true);
    try {
      const blob = await loanApi.downloadLetter(loan.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `moarefi-nameh-${loan.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Set flag
      setStoredFlag(`loan:${loan.id}:letterDownloaded`, 'true');
      setIsLetterDownloaded(true);
    } catch (e) {
      alert("خطا در دانلود فایل");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;
  if (!loan) return <div className="text-center pt-20">درخواستی یافت نشد.</div>;

  // Compute Logic for Stepper and UI State
  // New Logic: 1=Login, 2=Terms, 3=Info, 4=Letter, 5=Bank, 6=Credit
  const computeStep = () => {
    if (loan.status === LoanStatus.IdentityCheck || loan.status === LoanStatus.RejectedByShahkar) return 3;
    if (loan.status === LoanStatus.WaitingForLetter) return 4;
    // For letter issued: if not downloaded it's end of step 4 (action required), if downloaded it's start of step 5
    if (loan.status === LoanStatus.LetterIssued) return isLetterDownloaded ? 5 : 4;
    if (loan.status === LoanStatus.WaitingForBankApproval) return 5;
    if (loan.status === LoanStatus.LoanPaid) return 6;
    return 3;
  };

  const currentStep = computeStep();

  const renderStatusContent = () => {
    switch (loan.status) {
      case LoanStatus.IdentityCheck:
        return (
          <div className="text-center py-10">
            <Loader2 className="animate-spin w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">در حال احراز هویت شاهکار</h3>
            <p className="text-slate-500 text-sm">لطفاً شکیبا باشید، اطلاعات هویتی شما در حال بررسی است...</p>
          </div>
        );

      case LoanStatus.RejectedByShahkar:
        return (
          <div className="text-center py-10">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-600 mb-2">عدم تایید هویت</h3>
            <p className="text-slate-600 text-sm max-w-sm mx-auto">
              مشخصات کدملی و شماره موبایل شما مطابقت ندارد. لطفاً با پشتیبانی تماس بگیرید یا با شماره موبایل متعلق به خودتان ثبت نام کنید.
            </p>
          </div>
        );

      case LoanStatus.WaitingForLetter:
        return (
          <div className="text-center py-10">
            <Clock className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">در انتظار صدور معرفی‌نامه</h3>
            <p className="text-slate-500 text-sm">درخواست شما تایید شده و در صف صدور معرفی‌نامه است.</p>
          </div>
        );

      case LoanStatus.LetterIssued:
        return (
          <div className="text-center py-8">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">معرفی‌نامه صادر شد</h3>
            <p className="text-slate-500 text-sm mb-6">
              لطفاً معرفی‌نامه را دانلود کرده و به شعبه <b>{loan.branch.name}</b> مراجعه نمایید.
            </p>
            <button 
              onClick={handleDownload}
              disabled={downloadLoading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primaryHover flex items-center justify-center gap-2 mx-auto shadow-lg shadow-primary/20"
            >
              {downloadLoading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
              دانلود معرفی‌نامه (PDF)
            </button>
            {isLetterDownloaded && (
              <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm text-right">
                <p className="font-bold mb-1">گام بعدی:</p>
                پس از مراجعه به بانک و تکمیل پرونده، وضعیت پرونده شما به طور خودکار به "بررسی توسط بانک" تغییر خواهد کرد.
              </div>
            )}
          </div>
        );

      case LoanStatus.WaitingForBankApproval:
        return (
          <div className="text-center py-10">
            <ShieldCheck className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">در حال اعتبارسنجی بانکی</h3>
            <p className="text-slate-500 text-sm mb-4">پرونده شما در بانک شهر در حال بررسی است.</p>
            {/* Still allow download if needed */}
             <button 
              onClick={handleDownload}
              className="text-primary text-sm font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Download size={14} /> دانلود مجدد معرفی‌نامه
            </button>
          </div>
        );

      case LoanStatus.LoanPaid:
        return (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
               <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-800 mb-2">تسهیلات پرداخت شد</h3>
            <p className="text-emerald-700 mb-6">اعتبار سفر با موفقیت به حساب شما واریز شد.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-white p-4 rounded-lg shadow-sm">
               <div className="text-right">
                 <span className="block text-xs text-slate-400">مبلغ واریزی</span>
                 <span className="font-bold text-emerald-600">{(loan.bankResult?.paidAmountToman || loan.amountToman).toLocaleString()} تومان</span>
               </div>
               <div className="text-right">
                 <span className="block text-xs text-slate-400">تاریخ واریز</span>
                 <span className="font-bold text-slate-700">{new Date(loan.updatedAt).toLocaleDateString('fa-IR')}</span>
               </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Stepper6 currentStep={currentStep} />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">جزئیات درخواست</h2>
          <button onClick={() => refetch()} className="text-slate-400 hover:text-primary transition-colors" title="بروزرسانی">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          {renderStatusContent()}
        </div>

        {/* Info Grid - Always Visible */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
           <div>
             <span className="block text-xs text-slate-400 mb-1">شماره درخواست</span>
             <span className="font-mono">{loan.id}</span>
           </div>
           <div>
             <span className="block text-xs text-slate-400 mb-1">کد ملی</span>
             <span className="font-mono">{loan.nationalId}</span>
           </div>
           <div>
             <span className="block text-xs text-slate-400 mb-1">مبلغ</span>
             <span>{loan.amountToman.toLocaleString()}</span>
           </div>
           <div>
             <span className="block text-xs text-slate-400 mb-1">تاریخ درخواست</span>
             <span className="font-mono">{new Date(loan.createdAt).toLocaleDateString('fa-IR')}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoanRequestDetailPage;