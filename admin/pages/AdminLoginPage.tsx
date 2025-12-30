import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { Loader2, ShieldCheck } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await adminApi.login(username, password);
      history.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
             <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">پنل مدیریت توران</h1>
          <p className="text-slate-500 text-sm mt-2">لطفاً برای ورود اطلاعات خود را وارد کنید</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">نام کاربری</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all dir-ltr text-left"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رمز عبور</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all dir-ltr text-left"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="admin"
            />
          </div>

          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'ورود به پنل'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;