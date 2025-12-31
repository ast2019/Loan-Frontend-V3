import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loanApi, safeStorage } from '../services/apiClient';
import Stepper6 from '../components/Stepper6';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, FileText, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { LoanStatus } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check terms acceptance on mount
  useEffect(() => {
    const accepted = safeStorage.getItem('touran:termsAccepted') === 'true';
    setTermsAccepted(accepted);
  }, []);

  const { data: loan, isLoading, error, refetch } = useQuery({
    queryKey: ['activeLoan'],
    queryFn: loanApi.getActiveLoan,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  // Calculate generic step for dashboard visualization
  const getDashboardStep = () => {
    // Step 1 (Login) is done to be here.
    if (!termsAccepted) return 2; // Need to accept terms
    if (!loan) return 3; // Ready for info
    
    // If loan exists, map status to steps 4-6
    if (loan.status === LoanStatus.WaitingForLetter) return 4;
    if (loan.status === LoanStatus.LetterIssued) return 4; // Or 5 depending on download, simplifying here
    if (loan.status === LoanStatus.WaitingForBankApproval) return 5;
    if (loan.status === LoanStatus.LoanPaid) return 6;
    
    return 3; 
  };

  const statusLabels: Record<string, {text: string, color: string}> = {
    [LoanStatus.Submitted]: { text: 'ثبت شده', color: 'bg-blue-100 text-blue-700' },
    [LoanStatus.IdentityCheck]: { text: 'در حال بررسی شاهکار', color: 'bg-amber-100 text-amber-700' },
    [LoanStatus.RejectedByShahkar]: { text: 'عدم تایید هویت', color: 'bg-red-100 text-red-700' },
    [LoanStatus.WaitingForLetter]: { text: 'در انتظار صدور معرفی‌نامه', color: 'bg-purple-100 text-purple-700' },
    [LoanStatus.LetterIssued]: { text: 'معرفی‌نامه صادر شد', color: 'bg-green-100 text-green-700' },
    [LoanStatus.WaitingForBankApproval]: { text: 'بررسی توسط بانک', color: 'bg-indigo-100 text-indigo-700' },
    [LoanStatus.LoanPaid]: { text: 'پرداخت شده', color: 'bg-emerald-100 text-emerald-700' },
  };

  return (
    <div className="space-y-8">
      <Stepper6 currentStep={getDashboardStep()} />

      {!loan ? (
        // Empty State - No Active Loan
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">درخواست جدید</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            {!termsAccepted 
              ? 'برای شروع ثبت درخواست، ابتدا باید شرایط و قوانین طرح را مطالعه و تایید نمایید.'
              : 'شما هیچ درخواست تسهیلات فعالی ندارید. همین حالا می‌توانید فرآیند دریافت وام سفر خود را آغاز کنید.'
            }
          </p>

          {!termsAccepted ? (
             <Link 
               to="/app/terms" 
               className="inline-flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-lg"
             >
               <BookOpen size={18} /> مطالعه شرایط و قوانین (گام ۲)
             </Link>
          ) : (
             <Link 
               to="/app/new-request" 
               className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primaryHover transition-colors shadow-lg shadow-primary/20"
             >
               تکمیل اطلاعات و ثبت درخواست <ArrowLeft size={18} />
             </Link>
          )}
        </div>
      ) : (
        // Active Loan Card
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <span className="font-bold text-slate-700 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              درخواست فعال من
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusLabels[loan.status]?.color || 'bg-gray-100'}`}>
              {statusLabels[loan.status]?.text || loan.status}
            </span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-xs text-slate-400 mb-1">شماره پیگیری</span>
              <span className="font-mono font-bold text-slate-700">{loan.id}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-400 mb-1">مبلغ درخواستی</span>
              <span className="font-bold text-slate-700 text-lg">{loan.amountToman.toLocaleString()} <span className="text-xs font-normal text-slate-500">تومان</span></span>
            </div>
            <div>
              <span className="block text-xs text-slate-400 mb-1">مدت بازپرداخت</span>
              <span className="font-bold text-slate-700">{loan.tenorMonths} ماهه</span>
            </div>
            <div>
              <span className="block text-xs text-slate-400 mb-1">شعبه انتخابی</span>
              <span className="font-bold text-slate-700 text-sm">{loan.branch.name}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <Link 
              to="/app/request"
              className="text-primary font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              مشاهده جزئیات و پیگیری <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* New Request Button when Loan Exists */}
      {loan && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-1" size={20} />
          <div className="text-sm text-amber-800">
            <span className="font-bold block mb-1">محدودیت ثبت درخواست</span>
            شما یک درخواست فعال دارید. برای ثبت درخواست جدید، باید درخواست فعلی تعیین تکلیف شود.
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;