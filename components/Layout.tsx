import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Home, FileText } from 'lucide-react';
import { authApi } from '../services/apiClient';

interface LayoutProps {
  isAuthenticated?: boolean;
}

const Layout: React.FC<LayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check auth state dynamically
  const isUserAuthenticated = authApi.isAuthenticated();
  const user = authApi.getCurrentUser();

  const handleLogout = () => {
    authApi.logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">ت</div>
            <span className="font-bold text-lg text-slate-800">طرح توران</span>
          </Link>

          {isUserAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-slate-500">خوش آمدید</span>
                <span className="text-sm font-bold text-slate-700">{user?.mobile}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="خروج"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/auth/login" className="text-sm font-medium text-primary hover:text-primaryHover">
              ورود به سامانه
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 1404 سامانه تسهیلات سفر توران. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;