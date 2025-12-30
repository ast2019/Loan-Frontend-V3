import React from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import TermsPage from './pages/TermsPage';
import LoginMobilePage from './pages/LoginMobilePage';
import LoginOtpPage from './pages/LoginOtpPage';
import DashboardPage from './pages/DashboardPage';
import NewLoanRequestPage from './pages/NewLoanRequestPage';
import LoanRequestDetailPage from './pages/LoanRequestDetailPage';
import { authApi } from './services/apiClient';

// Admin Imports
import { adminApi } from './services/adminApi';
import AdminLayout from './admin/components/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import RequestsListPage from './admin/pages/RequestsListPage';
import RequestDetailPage from './admin/pages/RequestDetailPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = authApi.isAuthenticated();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = adminApi.isAuthenticated();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* --- Public User Routes (Step 1) --- */}
        <Route element={<Layout isAuthenticated={false} />}>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<LoginMobilePage />} />
          <Route path="/auth/otp" element={<LoginOtpPage />} />
        </Route>

        {/* --- Protected User Routes (Steps 2-6) --- */}
        <Route element={<Layout isAuthenticated={true} />}>
          {/* Step 2: Terms */}
          <Route 
             path="/app/terms" 
             element={<ProtectedRoute><TermsPage /></ProtectedRoute>} 
          />
          {/* Hub/Dashboard */}
          <Route 
            path="/app" 
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
          />
          {/* Step 3: New Request */}
          <Route 
            path="/app/new-request" 
            element={<ProtectedRoute><NewLoanRequestPage /></ProtectedRoute>} 
          />
          {/* Active Request Details */}
          <Route 
            path="/app/request" 
            element={<ProtectedRoute><LoanRequestDetailPage /></ProtectedRoute>} 
          />
        </Route>

        {/* --- Admin Routes --- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/requests" element={<RequestsListPage />} />
          <Route path="/admin/requests/:id" element={<RequestDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;