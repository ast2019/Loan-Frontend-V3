import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminApi.logout();
    navigate('/admin/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
      isActive 
        ? 'bg-primary/10 text-primary border-r-4 border-primary' 
        : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2">
          <div className="w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-slate-800">پنل مدیریت توران</span>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          <NavLink to="/admin/dashboard" className={navItemClass}>
            <LayoutDashboard size={20} />
            داشبورد
          </NavLink>
          <NavLink to="/admin/requests" className={navItemClass}>
            <FileText size={20} />
            درخواست‌های وام
          </NavLink>
          <NavLink to="/admin/users" className={navItemClass + " opacity-50 cursor-not-allowed"} onClick={e => e.preventDefault()}>
            <Users size={20} />
            کاربران (به زودی)
          </NavLink>
          <NavLink to="/admin/settings" className={navItemClass + " opacity-50 cursor-not-allowed"} onClick={e => e.preventDefault()}>
            <Settings size={20} />
            تنظیمات
          </NavLink>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            خروج از حساب
          </button>
        </div>
      </aside>

      <div className="flex-1 md:mr-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="md:hidden font-bold text-slate-800">پنل مدیریت</div>
          <div className="flex items-center gap-4 mr-auto">
             <div className="hidden md:flex flex-col items-end">
               <span className="text-sm font-bold text-slate-700">مدیر سیستم</span>
               <span className="text-xs text-slate-400">Super Admin</span>
             </div>
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
               <Shield size={20} />
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;