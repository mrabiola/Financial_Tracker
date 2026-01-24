import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DemoProvider } from './contexts/DemoContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthedAppShell from './components/common/AuthedAppShell';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import PasswordReset from './components/auth/PasswordReset';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import LandingPage from './components/landing/LandingPage';
import FinancialHealthWizard from './components/diagnostic/FinancialHealthWizard';
import DemoLanding from './components/demo/DemoLanding';
import DemoExpirationCheck from './components/demo/DemoExpirationCheck';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DemoProvider>
            <CurrencyProvider>
              <DemoExpirationCheck />
              <Routes>
                <Route path="/welcome" element={<LandingPage />} />
                <Route path="/diagnostic" element={<FinancialHealthWizard />} />
                <Route path="/demo-legacy" element={<DemoLanding />} />

                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/reset-password" element={<PasswordReset />} />

                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

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

                <Route path="/" element={<Navigate to="/welcome" replace />} />
                <Route path="*" element={<Navigate to="/welcome" replace />} />
              </Routes>
            </CurrencyProvider>
          </DemoProvider>
        </AuthProvider>
        <Analytics />
      </Router>
    </ErrorBoundary>
  );
}

export default App;