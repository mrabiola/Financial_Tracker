import React from 'react';
import { AlertCircle, Clock, ArrowRight, X } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

const DemoBanner = () => {
  const { 
    isDemo, 
    remainingTime, 
    showExpirationWarning,
    dismissConversionPrompt,
    endDemo
  } = useDemo();
  
  const navigate = useNavigate();

  if (!isDemo) return null;

  const handleSignUp = () => {
    navigate('/signup?convert=true');
  };

  const formatRemainingTime = () => {
    if (!remainingTime) return '';
    
    if (remainingTime.days > 0) {
      return `${remainingTime.days} day${remainingTime.days > 1 ? 's' : ''} ${remainingTime.hours} hour${remainingTime.hours > 1 ? 's' : ''}`;
    } else {
      return `${remainingTime.hours} hour${remainingTime.hours > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="relative">
      {/* Main Demo Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">Demo Mode</span>
                <span className="text-sm opacity-90">
                  Explore all features freely - your data is saved for 7 days
                </span>
                {remainingTime && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{formatRemainingTime()} remaining</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSignUp}
                className="inline-flex items-center px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Save Progress - Sign Up
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
              <button
                onClick={() => endDemo()}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Exit demo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expiration Warning */}
      {showExpirationWarning && remainingTime && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Your demo session expires in {formatRemainingTime()}.
                  Sign up now to save your data permanently.
                </span>
              </div>
              <button
                onClick={dismissConversionPrompt}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoBanner;