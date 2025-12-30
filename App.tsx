import React from 'react';
import { HashRouter, Switch, Route, Redirect, useHistory } from 'react-router-dom';
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
  const history = useHistory();
  const isAuthenticated = authApi.isAuthenticated();

  React.useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/auth/login');
    }
  }, [isAuthenticated, history]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const history = useHistory();
  const isAuthenticated = adminApi.isAuthenticated();

  React.useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/admin/login');
    }
  }, [isAuthenticated, history]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Switch>
        {/* Admin Login */}
        <Route path="/admin/login" component={AdminLoginPage} />

        {/* Admin Section */}
        <Route path="/admin">
          <ProtectedAdminRoute>
            <AdminLayout>
              <Switch>
                <Route path="/admin/dashboard" component={AdminDashboardPage} />
                <Route path="/admin/requests/:id" component={RequestDetailPage} />
                <Route path="/admin/requests" component={RequestsListPage} />
                <Redirect from="/admin" to="/admin/dashboard" />
              </Switch>
            </AdminLayout>
          </ProtectedAdminRoute>
        </Route>

        {/* Authenticated User App */}
        <Route path="/app">
           <ProtectedRoute>
             <Layout isAuthenticated={true}>
               <Switch>
                 <Route path="/app/terms" component={TermsPage} />
                 <Route path="/app/new-request" component={NewLoanRequestPage} />
                 <Route path="/app/request" component={LoanRequestDetailPage} />
                 <Route path="/app" component={DashboardPage} />
               </Switch>
             </Layout>
           </ProtectedRoute>
        </Route>

        {/* Public Routes */}
        <Route path="/">
           <Layout isAuthenticated={false}>
             <Switch>
               <Route path="/auth/login" component={LoginMobilePage} />
               <Route path="/auth/otp" component={LoginOtpPage} />
               <Redirect exact from="/" to="/auth/login" />
               <Redirect to="/auth/login" />
             </Switch>
           </Layout>
        </Route>

      </Switch>
    </HashRouter>
  );
};

export default App;