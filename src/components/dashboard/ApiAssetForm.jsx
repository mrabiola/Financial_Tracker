/**
 * API Asset Form Component
 * Enhanced form for adding stocks, crypto, and other API-linked assets
 */

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Plus, X, Clock, DollarSign } from 'lucide-react';
import { financialDataAPI, ASSET_TYPES, POPULAR_SYMBOLS } from '../../utils/api/financialDataAPI';

const ApiAssetForm = ({ onClose, onSave, selectedYear }) => {
  const [step, setStep] = useState(1); // 1: select type, 2: search/enter symbol, 3: enter quantity
  const [assetType, setAssetType] = useState('');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState('asset'); // asset or liability
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [popularTab, setPopularTab] = useState('stocks');

  // Calculate total value
  const totalValue = quantity && priceData?.price
    ? (parseFloat(quantity) * parseFloat(priceData.price)).toFixed(2)
    : '0.00';

  // Search for assets
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setError('');

    try {
      let results = [];

      if (assetType === 'stock' || assetType === 'etf') {
        const stockResults = await financialDataAPI.searchAssets(query, ['stock']);
        results = stockResults.stocks.concat(stockResults.etfs);
      } else if (assetType === 'crypto') {
        const cryptoResults = await financialDataAPI.searchAssets(query, ['crypto']);
        results = cryptoResults.cryptos;
      }

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle symbol selection
  const handleSelectAsset = async (asset) => {
    setSelectedAsset(asset);
    setSymbol(asset.symbol || asset.id);

    // Fetch current price
    setLoading(true);
    try {
      const price = await financialDataAPI.getPrice(
        assetType,
        asset.symbol || asset.id
      );
      if (price) {
        setPriceData(price);
        setStep(3);
      } else {
        setError('Could not fetch price for this asset');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual symbol entry
  const handleManualSymbol = async () => {
    if (!symbol) return;

    setLoading(true);
    setError('');

    try {
      const price = await financialDataAPI.getPrice(assetType, symbol);
      if (price) {
        setPriceData(price);
        setSelectedAsset({ symbol, name: price.name });
        setStep(3);
      } else {
        setError('Could not find this symbol. Please check and try again.');
      }
    } catch (err) {
      setError('Invalid symbol or API error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save the asset
  const handleSave = async () => {
    if (!quantity || !selectedAsset || !priceData) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const assetData = {
        name: selectedAsset.name || symbol,
        type: accountType,
        asset_type: assetType,
        api_symbol: symbol,
        api_provider: assetType === 'crypto' ? 'coingecko' : 'yahoo',
        quantity: parseFloat(quantity),
        last_price: parseFloat(priceData.price),
        auto_update: autoUpdate,
        icon: getAssetIcon()
      };

      await onSave(assetData);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  // Get appropriate icon based on asset type
  const getAssetIcon = () => {
    switch (assetType) {
      case 'stock':
        return 'TrendingUp';
      case 'crypto':
        return 'Bitcoin';
      case 'etf':
        return 'BarChart';
      case 'real_estate':
        return 'Home';
      default:
        return 'DollarSign';
    }
  };

  // Render step 1: Asset type selection
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">What type of asset would you like to add?</h3>

      <div className="grid grid-cols-2 gap-4">
        {[
          { type: 'stock', label: 'Stock', desc: 'Public company shares', icon: '📈' },
          { type: 'crypto', label: 'Cryptocurrency', desc: 'Bitcoin, Ethereum, etc.', icon: '₿' },
          { type: 'etf', label: 'ETF', desc: 'Exchange-traded funds', icon: '📊' },
          { type: 'real_estate', label: 'Real Estate', desc: 'Property value tracking', icon: '🏠' }
        ].map(({ type, label, desc, icon }) => (
          <button
            key={type}
            onClick={() => {
              setAssetType(type);
              setStep(2);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-medium">{label}</div>
            <div className="text-sm text-gray-500">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render step 2: Symbol search/entry
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Search {assetType === 'crypto' ? 'Cryptocurrency' : assetType === 'etf' ? 'ETF' : 'Stock'}
        </h3>
        <button
          onClick={() => setStep(1)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value);
            handleSearch(e.target.value);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleManualSymbol()}
          placeholder={`Search ${assetType === 'crypto' ? 'Bitcoin, Ethereum...' : 'AAPL, GOOGL, MSFT...'}`}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Popular symbols */}
      <div>
        <div className="flex gap-2 mb-3">
          {assetType !== 'real_estate' && ['stocks', 'crypto', 'etfs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setPopularTab(tab)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                popularTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {popularTab in POPULAR_SYMBOLS && (
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_SYMBOLS[popularTab].map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  setSymbol(item.symbol);
                  handleSelectAsset(item);
                }}
                className="text-left p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="font-medium">{item.symbol}</div>
                <div className="text-sm text-gray-500">{item.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectAsset(result)}
              className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{result.symbol || result.id?.toUpperCase()}</div>
              <div className="text-sm text-gray-500">{result.name}</div>
              {result.exchange && (
                <div className="text-xs text-gray-400">{result.exchange}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Manual entry option */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleManualSymbol}
          disabled={!symbol || loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Fetching...' : 'Use Symbol Manually'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );

  // Render step 3: Quantity entry and confirmation
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Enter Quantity</h3>
        <button
          onClick={() => setStep(2)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Asset details */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold">{selectedAsset.name}</div>
            <div className="text-sm text-gray-500">{symbol}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Price</div>
            <div className="font-semibold">
              ${parseFloat(priceData.price).toLocaleString()}
            </div>
            {priceData.changePercent && (
              <div className={`text-sm flex items-center justify-end gap-1 ${
                parseFloat(priceData.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {parseFloat(priceData.changePercent) >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(parseFloat(priceData.changePercent)).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quantity input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          step="0.00000001"
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Account type selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAccountType('asset')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              accountType === 'asset'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Asset</div>
            <div className="text-sm text-gray-500">Something you own</div>
          </button>
          <button
            onClick={() => setAccountType('liability')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              accountType === 'liability'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Liability</div>
            <div className="text-sm text-gray-500">Something you owe</div>
          </button>
        </div>
      </div>

      {/* Auto-update toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Auto-update Price</div>
          <div className="text-sm text-gray-500">Automatically fetch current price</div>
        </div>
        <button
          onClick={() => setAutoUpdate(!autoUpdate)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoUpdate ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoUpdate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Total value display */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Total Value</span>
          </div>
          <span className="text-xl font-bold text-blue-900">
            ${parseFloat(totalValue).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={!quantity}
          className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add Asset
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  stepNum <= step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-300'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>

          {/* Render current step */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default ApiAssetForm;