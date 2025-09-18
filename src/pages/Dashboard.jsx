import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import NetWorthTracker from '../components/dashboard/NetWorthTracker';
import DataMigration from '../components/common/DataMigration';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { useInitialDataSetup } from '../hooks/useInitialDataSetup';
import DemoBanner from '../components/demo/DemoBanner';
import ConversionModal from '../components/demo/ConversionModal';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isDemo, showConversionPrompt, dismissConversionPrompt } = useDemo();
  const navigate = useNavigate();
  const [showMigration, setShowMigration] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const { isInitializing } = useInitialDataSetup();

  useEffect(() => {
    // Check for local storage data on mount
    const saved = localStorage.getItem('financeData');
    const migrated = localStorage.getItem('dataMigrated');
    
    if (saved && !migrated) {
      const data = JSON.parse(saved);
      const currentYear = new Date().getFullYear();
      
      // Only show migration if there's data for the current year
      if (data.years && data.years[currentYear]) {
        setLocalData(data);
        setShowMigration(true);
      }
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleMigrationComplete = () => {
    setShowMigration(false);
    window.location.reload(); // Reload to fetch the migrated data
  };

  // Show conversion modal when prompted
  useEffect(() => {
    if (showConversionPrompt && isDemo) {
      setShowConversionModal(true);
    }
  }, [showConversionPrompt, isDemo]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Demo Banner */}
      {isDemo && <DemoBanner />}
      
      {/* Conversion Modal */}
      <ConversionModal 
        isOpen={showConversionModal} 
        onClose={() => {
          setShowConversionModal(false);
          dismissConversionPrompt();
        }}
      />
      
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="hover:opacity-80 transition-opacity"
                title="Go to Dashboard"
              >
                <Logo size="default" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Profile Settings"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        {isInitializing ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your financial dashboard...</p>
            </div>
          </div>
        ) : (
          <NetWorthTracker />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo and Description */}
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <span className="text-sm text-gray-600">Secure financial management platform</span>
            </div>
            
            {/* Legal Links and Copyright */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link 
                to="/terms" 
                className="hover:text-blue-600 transition-colors"
              >
                Terms
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/privacy" 
                className="hover:text-blue-600 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-gray-400">•</span>
              <span>© 2025 Techbrov. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Data Migration Modal */}
      {showMigration && localData && (
        <DataMigration
          localData={localData}
          onClose={() => setShowMigration(false)}
          onComplete={handleMigrationComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;