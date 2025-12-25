import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DemoProvider } from './contexts/DemoContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthedAppShell from './components/common/AuthedAppShell';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import PasswordReset from './components/auth/PasswordReset';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
// New landing page with Financial Health Diagnostic funnel
import LandingPage from './components/landing/LandingPage';
import FinancialHealthWizard from './components/diagnostic/FinancialHealthWizard';
// Legacy demo components (kept for reference, can be removed if bundle size is a concern)
import DemoLanding from './components/demo/DemoLanding';
import DemoExpirationCheck from './components/demo/DemoExpirationCheck';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DemoProvider>
          <CurrencyProvider>
            <DemoExpirationCheck />
            <Routes>
            {/* New Landing page with Financial Health Diagnostic */}
            <Route path="/welcome" element={<LandingPage />} />
            
            {/* Financial Health Diagnostic Wizard */}
            <Route path="/diagnostic" element={<FinancialHealthWizard />} />
            
            {/* Legacy demo landing (kept for backwards compatibility) */}
            <Route path="/demo-legacy" element={<DemoLanding />} />
            
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            
            {/* Legal pages - publicly accessible */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* Protected routes (theme-scoped; does not affect public pages) */}
            <Route
              element={
                <ProtectedRoute>
                  <AuthedAppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </CurrencyProvider>
        </DemoProvider>
      </AuthProvider>
      <Analytics />
    </Router>
  );
}

export default App;