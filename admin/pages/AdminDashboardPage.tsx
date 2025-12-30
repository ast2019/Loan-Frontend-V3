import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { LoanStatus } from '../../types';
import { Users, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const { data: requests } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => adminApi.getRequests(),
  });

  if (!requests) return null;

  const stats = {
    total: requests.length,
    waitingLetter: requests.filter(r => r.status === LoanStatus.WaitingForLetter).length,
    waitingBank: requests.filter(r => r.status === LoanStatus.WaitingForBankApproval).length,
    paid: requests.filter(r => r.status === LoanStatus.LoanPaid).length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">داشبورد مدیریت</h1>
        <p className="text-slate-500">خلاصه وضعیت درخواست‌های وام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="کل درخواست‌ها" value={stats.total} icon={FileText} color="bg-blue-500" />
        <StatCard title="منتظر صدور نامه" value={stats.waitingLetter} icon={Clock} color="bg-purple-500" />
        <StatCard title="منتظر تایید بانک" value={stats.waitingBank} icon={Users} color="bg-indigo-500" />
        <StatCard title="پرداخت شده" value={stats.paid} icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">اقدامات فوری</h2>
          <Link to="/admin/requests" className="text-primary text-sm hover:underline">مشاهده همه</Link>
        </div>
        
        <div className="space-y-4">
           {stats.waitingLetter > 0 ? (
             <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg border border-purple-100">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                 <span className="text-purple-900 font-medium">{stats.waitingLetter} درخواست منتظر صدور معرفی‌نامه هستند.</span>
               </div>
               <Link to={`/admin/requests?status=${LoanStatus.WaitingForLetter}`} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700">بررسی</Link>
             </div>
           ) : (
             <p className="text-slate-500 text-sm">مورد فوری برای بررسی وجود ندارد.</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;