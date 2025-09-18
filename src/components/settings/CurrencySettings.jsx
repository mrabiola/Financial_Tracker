import React, { useState } from 'react';
import { DollarSign, RefreshCw, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useDemo } from '../../contexts/DemoContext';
import { getCurrencyList } from '../../utils/currency';

const CurrencySettings = () => {
  const {
    currency,
    currencyDetails,
    updateCurrency,
    exchangeRates,
    ratesLoading,
    ratesError,
    refreshRates
  } = useCurrency();

  const { isDemo } = useDemo();
  
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const currencyOptions = getCurrencyList();
  
  const handleSave = async () => {
    if (selectedCurrency === currency) {
      setSaveMessage('Currency is already set to ' + currencyDetails.name);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setSaving(true);
    const success = updateCurrency(selectedCurrency);

    if (success) {
      setSaveMessage(
        isDemo
          ? 'Currency updated successfully! (Demo mode - settings saved locally)'
          : 'Currency updated successfully!'
      );
    } else {
      setSaveMessage('Failed to update currency');
    }

    setTimeout(() => setSaveMessage(''), 4000);
    setSaving(false);
  };
  
  const handleRefreshRates = () => {
    refreshRates();
  };
  
  const formatLastUpdated = () => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return 'Not loaded';
    }
    
    // This is a simple approach - in production you might want to store the timestamp
    return 'Recently updated';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Currency Settings
            {isDemo && <span className="text-sm font-normal text-blue-600 ml-2">(Demo Mode)</span>}
          </h3>
          <p className="text-sm text-gray-500">
            Choose your preferred currency for displaying financial data
            {isDemo && <span className="text-blue-600"> - Works in demo mode!</span>}
          </p>
        </div>
      </div>

      {/* Demo Notice */}
      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              <span className="font-medium">Demo mode:</span> Currency settings are fully functional and saved locally.
              Real-time exchange rates and conversions work the same as in full accounts!
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Currency
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {currencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            All financial data will be displayed in this currency using real-time exchange rates
          </p>
        </div>

        {/* Current Currency Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Currency</span>
            <span className="text-lg font-semibold text-gray-900">
              {currencyDetails.symbol} {currency}
            </span>
          </div>
          <p className="text-sm text-gray-600">{currencyDetails.name}</p>
        </div>

        {/* Exchange Rate Status */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">Exchange Rates</span>
              {ratesLoading && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
            </div>
            <button
              onClick={handleRefreshRates}
              disabled={ratesLoading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-blue-700">
            {ratesError ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">Error loading rates: {ratesError}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Last updated: {formatLastUpdated()}</span>
              </>
            )}
          </div>
          
          <p className="text-xs text-blue-600 mt-1">
            Rates are cached for 5 minutes and updated automatically
          </p>
        </div>

        {/* Sample Conversion */}
        {currency !== 'USD' && exchangeRates.USD && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900">Sample Conversion</span>
              <div className="text-right">
                <div className="text-sm text-green-700">$1,000 USD</div>
                <div className="text-sm font-semibold text-green-900">
                  ≈ {currencyDetails.symbol}{(1000 / exchangeRates.USD).toFixed(2)} {currency}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving || selectedCurrency === currency}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCurrency === currency
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Currency Settings'}
          </button>
          
          {saveMessage && (
            <div className={`flex items-center gap-2 text-sm ${
              saveMessage.includes('successfully') ? 'text-green-600' : 'text-amber-600'
            }`}>
              {saveMessage.includes('successfully') ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;