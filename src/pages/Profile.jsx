import React, { useState } from 'react';
import { User, Mail, Save, AlertCircle, CheckCircle, LogOut, Play } from 'lucide-react';
import Logo from '../components/Logo';
import CurrencySettings from '../components/settings/CurrencySettings';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { isDemo, demoSessionId, endDemo } = useDemo();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || (isDemo ? 'Demo User' : ''));
  const email = user?.email || (isDemo ? 'demo@example.com' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Check if it's a demo account
    if (isDemo) {
      setError('Profile editing is not available in demo mode. Sign up to save profile changes permanently.');
      setLoading(false);
      return;
    }

    // Check if user is null (shouldn't happen for real accounts)
    if (!user) {
      setError('User session not found. Please sign in again.');
      setLoading(false);
      return;
    }

    const result = await updateProfile({ full_name: fullName });

    if (result.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    if (isDemo) {
      await endDemo();
      navigate('/login');
    } else {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="small" showText={false} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500">Manage your account information</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Demo Account Notice */}
        {isDemo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Demo Mode Active</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You're using a temporary demo account. Profile changes aren't saved permanently.
                  <span className="font-medium"> Sign up to keep your data and access all features!</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
            {isDemo && <span className="text-sm font-normal text-gray-500 ml-2">(Demo - Read Only)</span>}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isDemo}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDemo ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''
                  }`}
                  placeholder={isDemo ? "Demo User (Read Only)" : "John Doe"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || isDemo}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDemo
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={isDemo ? "Profile editing not available in demo mode" : ""}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : isDemo ? 'Demo Mode - Read Only' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">
                {isDemo ? 'Demo Session ID' : 'User ID'}
              </span>
              <span className="text-sm font-mono text-gray-900">
                {isDemo
                  ? (demoSessionId?.slice(0, 16) || 'N/A') + '...'
                  : (user?.id?.slice(0, 8) || 'N/A') + '...'
                }
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">
                {isDemo ? 'Session Created' : 'Account Created'}
              </span>
              <span className="text-sm text-gray-900">
                {isDemo
                  ? new Date().toLocaleDateString()
                  : (user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A')
                }
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">
                {isDemo ? 'Account Type' : 'Subscription'}
              </span>
              <span className={`text-sm ${isDemo ? 'text-blue-600 font-medium' : 'text-gray-900'}`}>
                {isDemo ? 'Demo Account (7-day trial)' : 'Free Plan'}
              </span>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <CurrencySettings />

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            {isDemo ? 'Demo Session Controls' : 'Danger Zone'}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {isDemo ? 'End your demo session' : 'Sign out of your account'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isDemo
                  ? 'Demo data will be cleared and you\'ll return to the login page'
                  : 'You will need to sign in again to access your data'
                }
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
              {isDemo ? 'End Demo' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;