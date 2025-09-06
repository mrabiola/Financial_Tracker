import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import NetWorthTracker from '../components/dashboard/NetWorthTracker';
import DataMigration from '../components/common/DataMigration';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMigration, setShowMigration] = useState(false);
  const [localData, setLocalData] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
      <NetWorthTracker />

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