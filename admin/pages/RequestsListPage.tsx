import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { LoanStatus } from '../../types';
import { Loader2, Search, Filter, Eye } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const RequestsListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const statusFilter = searchParams.get('status') || '';

  const { data: requests, isLoading } = useQuery({
    queryKey: ['adminRequests', statusFilter, searchTerm],
    queryFn: () => adminApi.getRequests({ status: statusFilter, search: searchTerm }),
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(location.search);
    if (e.target.value) {
        params.set('status', e.target.value);
    } else {
        params.delete('status');
    }
    navigate({ search: params.toString() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">درخواست‌های وام</h1>
          <p className="text-slate-500 text-sm mt-1">مدیریت و پیگیری درخواست‌های ثبت شده</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
             <Search className="absolute right-3 top-3 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="جستجو (نام، کدملی، موبایل)" 
               className="pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="relative">
            <Filter className="absolute right-3 top-3 text-slate-400" size={18} />
            <select 
              className="pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary w-48"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">همه وضعیت‌ها</option>
              <option value={LoanStatus.WaitingForLetter}>منتظر معرفی‌نامه</option>
              <option value={LoanStatus.LetterIssued}>معرفی‌نامه صادر شده</option>
              <option value={LoanStatus.WaitingForBankApproval}>منتظر تایید بانک</option>
              <option value={LoanStatus.LoanPaid}>پرداخت شده</option>
              <option value={LoanStatus.RejectedByShahkar}>رد شده (شاهکار)</option>
              <option value={LoanStatus.Closed}>بسته شده</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
        ) : requests?.length === 0 ? (
           <div className="p-20 text-center text-slate-500">هیچ درخواستی با این مشخصات یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">شماره درخواست</th>
                  <th className="px-6 py-4 font-medium">متقاضی</th>
                  <th className="px-6 py-4 font-medium">مبلغ / مدت</th>
                  <th className="px-6 py-4 font-medium">شعبه</th>
                  <th className="px-6 py-4 font-medium">وضعیت</th>
                  <th className="px-6 py-4 font-medium">تاریخ ثبت</th>
                  <th className="px-6 py-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests!.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{req.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{req.mobile}</div>
                      <div className="text-slate-500 text-xs font-mono mt-0.5">{req.nationalId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{req.amountToman.toLocaleString()}</div>
                      <div className="text-slate-500 text-xs">{req.tenorMonths} ماهه</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[150px] truncate" title={req.branch.name}>
                      {req.branch.name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {new Date(req.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/admin/requests/${req.id}`}
                        className="flex items-center gap-1 text-primary hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium w-fit"
                      >
                        <Eye size={16} /> بررسی
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsListPage;