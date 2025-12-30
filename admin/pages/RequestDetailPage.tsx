import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { LoanStatus } from '../../types';
import StatusBadge from '../components/StatusBadge';
import Stepper6 from '../../components/Stepper6';
import { Loader2, ArrowRight, Download, Printer, Ban, CheckCircle, Save } from 'lucide-react';

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const [bankApproved, setBankApproved] = useState(true);
  const [finalAmount, setFinalAmount] = useState<string>('');
  
  const { data: req, isLoading } = useQuery({
    queryKey: ['adminRequest', id],
    queryFn: () => adminApi.getRequestById(id!),
    enabled: !!id
  });

  const mutation = useMutation({
    mutationFn: (action: () => Promise<any>) => action(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequest', id] });
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      setShowIssueModal(false);
      setShowBankModal(false);
      setShowCloseModal(false);
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  if (!req) return <div className="text-center py-20">درخواست یافت نشد</div>;

  const getStep = (s: string) => {
    if (s === LoanStatus.IdentityCheck) return 3;
    if (s === LoanStatus.RejectedByShahkar) return 3;
    if (s === LoanStatus.WaitingForLetter) return 4;
    if (s === LoanStatus.LetterIssued) return 4; 
    if (s === LoanStatus.WaitingForBankApproval) return 5;
    if (s === LoanStatus.LoanPaid) return 6;
    return 3;
  };

  const handleIssueLetter = () => {
    mutation.mutate(() => adminApi.issueLetter(req.id));
  };

  const handleBankResult = () => {
    mutation.mutate(() => adminApi.recordBankResult(req.id, bankApproved, {
       amount: Number(finalAmount || req.amountToman),
       tenor: req.tenorMonths
    }));
  };

  const handleCloseRequest = () => {
     mutation.mutate(() => adminApi.closeRequest(req.id));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/requests')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
           <ArrowRight size={20} />
        </button>
        <div>
           <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-slate-800">جزئیات درخواست {req.id}</h1>
             <StatusBadge status={req.status} />
           </div>
           <p className="text-slate-500 text-sm mt-1">ایجاد شده در {new Date(req.createdAt).toLocaleDateString('fa-IR')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <Stepper6 currentStep={getStep(req.status)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">اطلاعات پرونده</div>
             <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                   <label className="block text-xs text-slate-400 mb-1">نام متقاضی (از شاهکار)</label>
                   <span className="font-bold text-slate-800">علی محمدی (تستی)</span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">کد ملی</label>
                   <span className="font-mono font-bold text-slate-800">{req.nationalId}</span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">شماره موبایل</label>
                   <span className="font-mono font-bold text-slate-800">{req.mobile}</span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">شعبه انتخابی</label>
                   <span className="font-bold text-slate-800">{req.branch.name} <span className="text-xs text-slate-400 font-normal">({req.branch.code})</span></span>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2"></div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">مبلغ درخواستی</label>
                   <span className="font-bold text-xl text-primary">{req.amountToman.toLocaleString()} <span className="text-sm text-slate-500 font-normal">تومان</span></span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">مدت بازپرداخت</label>
                   <span className="font-bold text-slate-800">{req.tenorMonths} ماهه</span>
                </div>
             </div>
           </div>

           {req.bankResult && (
             <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} />
                  نتیجه نهایی بانک
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                   <div>
                     <span className="block text-emerald-600/70 mb-1">مبلغ واریزی</span>
                     <span className="font-bold text-emerald-900">{req.bankResult.paidAmountToman.toLocaleString()}</span>
                   </div>
                   <div>
                     <span className="block text-emerald-600/70 mb-1">تاریخ واریز</span>
                     <span className="font-bold text-emerald-900">{new Date(req.bankResult.paidAt).toLocaleDateString('fa-IR')}</span>
                   </div>
                </div>
             </div>
           )}
        </div>

        <div className="space-y-4">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">عملیات مجاز</h3>
              <div className="space-y-3">
                 
                 {req.status === LoanStatus.WaitingForLetter && (
                    <button 
                      onClick={() => setShowIssueModal(true)}
                      className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primaryHover transition-colors flex items-center justify-center gap-2"
                    >
                       <Printer size={18} /> صدور معرفی‌نامه
                    </button>
                 )}

                 {(req.status === LoanStatus.LetterIssued || req.status === LoanStatus.WaitingForBankApproval) && (
                    <button 
                      className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                       <Download size={18} /> دانلود فایل معرفی‌نامه
                    </button>
                 )}

                 {req.status === LoanStatus.WaitingForBankApproval && (
                    <button 
                      onClick={() => setShowBankModal(true)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                       <Save size={18} /> ثبت نتیجه بانک
                    </button>
                 )}
                 
                 {req.status !== LoanStatus.Closed && req.status !== LoanStatus.LoanPaid && (
                   <button 
                     onClick={() => setShowCloseModal(true)}
                     className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mt-6"
                   >
                      <Ban size={18} /> بستن درخواست (Close)
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-800">صدور معرفی‌نامه بانکی</h3>
              </div>
              <div className="p-6 space-y-4">
                 <p className="text-sm text-slate-600">آیا از صدور معرفی‌نامه برای <b>{req.nationalId}</b> جهت معرفی به <b>{req.branch.name}</b> اطمینان دارید؟</p>
                 <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800">
                    با تایید این مورد، وضعیت پرونده به "معرفی‌نامه صادر شد" تغییر کرده و فایل PDF برای کاربر قابل دانلود خواهد بود.
                 </div>
              </div>
              <div className="p-4 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setShowIssueModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200">انصراف</button>
                 <button 
                   onClick={handleIssueLetter} 
                   disabled={mutation.isPending}
                   className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primaryHover flex items-center gap-2"
                 >
                    {mutation.isPending && <Loader2 className="animate-spin" size={16} />} تایید و صدور
                 </button>
              </div>
           </div>
        </div>
      )}

      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-800">ثبت نتیجه بررسی بانک</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-2">نتیجه بررسی</label>
                    <div className="flex gap-4">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={bankApproved} onChange={() => setBankApproved(true)} className="w-5 h-5 text-green-600" />
                          <span className="text-sm">تایید و پرداخت وام</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={!bankApproved} onChange={() => setBankApproved(false)} className="w-5 h-5 text-red-600" />
                          <span className="text-sm">رد درخواست</span>
                       </label>
                    </div>
                 </div>
                 
                 {bankApproved && (
                   <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-medium mb-2">مبلغ نهایی واریزی (تومان)</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        placeholder={req.amountToman.toString()}
                        value={finalAmount}
                        onChange={e => setFinalAmount(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 mt-1">در صورت خالی بودن، مبلغ درخواستی ({req.amountToman.toLocaleString()}) ثبت می‌شود.</p>
                   </div>
                 )}
              </div>
              <div className="p-4 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setShowBankModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200">انصراف</button>
                 <button 
                   onClick={handleBankResult} 
                   disabled={mutation.isPending}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"
                 >
                    {mutation.isPending && <Loader2 className="animate-spin" size={16} />} ثبت نهایی
                 </button>
              </div>
           </div>
        </div>
      )}

      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-red-50">
                 <h3 className="text-lg font-bold text-red-700 flex items-center gap-2"><Ban size={20} /> بستن درخواست</h3>
              </div>
              <div className="p-6 space-y-4">
                 <p className="text-slate-700 font-bold">آیا مطمئن هستید؟</p>
                 <p className="text-sm text-slate-600 leading-6">
                    با بستن این درخواست، کاربر قادر خواهد بود یک <b>درخواست جدید</b> ثبت کند. این عملیات برای درخواست‌هایی که مشکل دارند یا توسط کاربر لغو شده‌اند استفاده می‌شود.
                 </p>
              </div>
              <div className="p-4 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setShowCloseModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200">انصراف</button>
                 <button 
                   onClick={handleCloseRequest} 
                   disabled={mutation.isPending}
                   className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
                 >
                    {mutation.isPending && <Loader2 className="animate-spin" size={16} />} بستن پرونده
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default RequestDetailPage;