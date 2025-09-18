import React, { useState } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  PlayCircle,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../../contexts/DemoContext';
import Logo from '../Logo';

const DemoLanding = () => {
  const navigate = useNavigate();
  const { startDemo } = useDemo();
  const [loading, setLoading] = useState(false);

  const handleTryDemo = async () => {
    setLoading(true);
    try {
      const result = await startDemo();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error starting demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <PieChart className="h-6 w-6" />,
      title: 'Asset Tracking',
      description: 'Monitor all your assets and liabilities in one place'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Goal Setting',
      description: 'Set and track progress towards financial goals'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Net Worth Analysis',
      description: 'Visualize your financial growth over time'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Multi-Currency',
      description: 'Support for 30+ currencies with live rates'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Import/Export',
      description: 'Easily import data from CSV files'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Private',
      description: 'Bank-level encryption for your data'
    }
  ];

  const demoHighlights = [
    'Full access to all features',
    'Pre-loaded with sample data',
    'Your changes are saved for 7 days',
    'No signup required',
    'Convert to full account anytime'
  ];

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="default" showText={true} />
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
                style={{ backgroundColor: '#4F85FF' }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Take Control of Your
              <span style={{ color: '#4F85FF' }}>
                {' '}Financial Future
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track assets, manage liabilities, and achieve your financial goals with WealthTrak's 
              comprehensive personal finance platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleTryDemo}
                disabled={loading}
                className="inline-flex items-center justify-center px-6 py-3 text-white text-base font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ backgroundColor: '#4F85FF' }}
              >
                <PlayCircle className="mr-2 h-6 w-6" />
                {loading ? 'Starting Demo...' : 'Try Demo - No Signup Required'}
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 text-base font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            
            {/* Demo Highlights */}
            <div className="inline-flex flex-wrap gap-3 justify-center">
              {demoHighlights.map((highlight, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Wealth
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to give you complete control over your financial life
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 text-brand-blue rounded-lg">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How Demo Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How the Demo Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the full power of WealthTrak without creating an account
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 text-white rounded-full text-xl font-bold mb-4" style={{ backgroundColor: '#4F85FF' }}>
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Click "Try Demo"
              </h3>
              <p className="text-gray-600 text-sm">
                Instantly access the app with pre-loaded sample financial data
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 text-white rounded-full text-xl font-bold mb-4" style={{ backgroundColor: '#4F85FF' }}>
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Explore Features
              </h3>
              <p className="text-gray-600 text-sm">
                Add accounts, set goals, track progress - everything works
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 text-white rounded-full text-xl font-bold mb-4" style={{ backgroundColor: '#4F85FF' }}>
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Save Your Progress
              </h3>
              <p className="text-gray-600 text-sm">
                Create an account anytime to keep your data permanently
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start your financial journey today with our free demo
          </p>
          <button
            onClick={handleTryDemo}
            disabled={loading}
            className="inline-flex items-center justify-center px-6 py-3 text-white text-base font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{ backgroundColor: '#4F85FF' }}
          >
            <PlayCircle className="mr-2 h-6 w-6" />
            {loading ? 'Starting Demo...' : 'Start Free Demo Now'}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            No credit card • No signup • 7-day data retention
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoLanding;