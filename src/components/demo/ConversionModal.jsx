import React from 'react';
import { X, CheckCircle, ArrowRight, Shield, Clock, Database } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

const ConversionModal = ({ isOpen, onClose }) => {
  const { remainingTime, dismissConversionPrompt } = useDemo();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignUp = () => {
    navigate('/signup?convert=true');
    onClose();
  };

  const handleDismiss = () => {
    dismissConversionPrompt();
    onClose();
  };

  const benefits = [
    {
      icon: <Database className="h-5 w-5 text-blue-500" />,
      title: 'Keep All Your Data',
      description: 'All demo data transfers seamlessly to your account'
    },
    {
      icon: <Clock className="h-5 w-5 text-green-500" />,
      title: 'Unlimited Access',
      description: 'No expiration - your data is saved permanently'
    },
    {
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      title: 'Secure & Private',
      description: 'Bank-level encryption for all your financial data'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleDismiss}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Content */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              You're doing great!
            </h3>
            <p className="text-sm text-gray-600">
              Ready to save your progress permanently? Create a free account to keep all your data.
            </p>
            {remainingTime && (
              <p className="text-xs text-gray-500 mt-2">
                Demo expires in {remainingTime.days} days {remainingTime.hours} hours
              </p>
            )}
          </div>
          
          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSignUp}
              disabled={false}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Continue Demo
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionModal;