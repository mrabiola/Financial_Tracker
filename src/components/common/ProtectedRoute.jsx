import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDemo } from '../../contexts/DemoContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isDemo, loading: demoLoading } = useDemo();
  const location = useLocation();

  if (authLoading || demoLoading) {
    return <LoadingSpinner />;
  }

  // Allow access if user is authenticated OR in demo mode
  if (!user && !isDemo) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;