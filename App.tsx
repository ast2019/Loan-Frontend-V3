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
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Section */}
        <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
        }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="requests" element={<RequestsListPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
        </Route>

        {/* Authenticated User App */}
        <Route path="/app" element={
            <ProtectedRoute>
              <Layout isAuthenticated={true} />
            </ProtectedRoute>
        }>
            <Route index element={<DashboardPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="new-request" element={<NewLoanRequestPage />} />
            <Route path="request" element={<LoanRequestDetailPage />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        <Route element={<Layout isAuthenticated={false} />}>
            <Route path="/auth/login" element={<LoginMobilePage />} />
            <Route path="/auth/otp" element={<LoginOtpPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />

      </Routes>
    </HashRouter>
  );
};

export default App;