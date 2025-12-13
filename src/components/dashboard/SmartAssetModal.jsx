/**
 * Smart Asset Modal - Unified asset creation with API integration
 * Automatically detects asset type and provides appropriate input methods
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Home, Car, PiggyBank, Wallet, Coins, MapPin, X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { financialDataAPI } from '../../utils/api/financialDataAPI';
import { atomAPI, getPropertyEstimate as getPropertyMockEstimate } from '../../utils/api/atomAPI';

const SmartAssetModal = ({ isOpen, onClose, onSave, selectedYear, accountType = 'asset' }) => {
  const [step, setStep] = useState(1);
  const [assetName, setAssetName] = useState('');
  const [detectedType, setDetectedType] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [priceData, setPriceData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [propertyType, setPropertyType] = useState('residential');
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  // Smart asset type detection
  const detectAssetType = (name) => {
    const lower = name.toLowerCase();

    // Real estate keywords
    if (lower.includes('house') || lower.includes('home') || lower.includes('property') ||
        lower.includes('condo') || lower.includes('apartment') || lower.includes('rental') ||
        lower.includes('real estate') || lower.includes('land')) {
      return 'real_estate';
    }

    // Investment keywords
    if (lower.includes('401k') || lower.includes('ira') || lower.includes('roth') ||
        lower.includes('retirement') || lower.includes('pension') || lower.includes('403b')) {
      return 'retirement';
    }

    // Vehicle keywords
    if (lower.includes('car') || lower.includes('vehicle') || lower.includes('auto') ||
        lower.includes('truck') || lower.includes('motorcycle')) {
      return 'vehicle';
    }

    // Stock/Brokerage keywords
    if (lower.includes('stock') || lower.includes('robinhood') || lower.includes('fidelity') ||
        lower.includes('vanguard') || lower.includes('etrade') || lower.includes('brokerage')) {
      return 'investment';
    }

    // Crypto keywords
    if (lower.includes('bitcoin') || lower.includes('ethereum') || lower.includes('crypto') ||
        lower.includes('coinbase') || lower.includes('binance')) {
      return 'crypto';
    }

    // Savings keywords
    if (lower.includes('save') || lower.includes('savings') || lower.includes('emergency') ||
        lower.includes('checking')) {
      return 'cash';
    }

    return 'manual';
  };

  // Handle name change with auto-detection
  const handleNameChange = (e) => {
    const name = e.target.value;
    setAssetName(name);
    const detected = detectAssetType(name);
    setDetectedType(detected);
  };

  // Search for assets
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setError('');

    try {
      const results = await financialDataAPI.searchAssets(query, ['stock', 'crypto', 'etf']);
      setSearchResults([...results.stocks.slice(0, 5), ...results.etfs.slice(0, 3), ...results.cryptos.slice(0, 3)]);
    } catch (err) {
      setError('Search failed. Please try again.');
    }
  };

  // Handle symbol selection
  const handleSelectAsset = async (asset) => {
    setSymbol(asset.symbol || asset.id);

    try {
      const price = await financialDataAPI.getPrice(
        asset.type === 'cryptocurrency' ? 'crypto' : 'stock',
        asset.symbol || asset.id
      );

      if (price) {
        setPriceData(price);
        setStep(3);
      } else {
        setError('Could not fetch price data');
      }
    } catch (err) {
      setError('Failed to fetch current price');
    }
  };

  // Handle manual symbol entry
  const handleManualSymbolEntry = useCallback(async () => {
    if (!symbol) return;

    try {
      const price = await financialDataAPI.getPrice(
        detectedType === 'crypto' ? 'crypto' : 'stock',
        symbol
      );

      if (price) {
        setPriceData(price);
        setStep(3);
      } else {
        setError('Could not fetch price data. Please check the symbol and try again.');
      }
    } catch (err) {
      setError('Failed to fetch current price. Please try again later.');
    }
  }, [symbol, detectedType]);

  // Get property value estimate using Attom API
  const getPropertyEstimate = useCallback(async () => {
    setError('');
    setStep(3);

    const hasApiKey = process.env.REACT_APP_ATTOM_API_KEY;

    try {
      if (hasApiKey) {
        // Try Attom API first
        const result = await atomAPI.searchByAddress(address);

        if (result && result.success) {
          const data = result.data;
          setPriceData({
            price: data.totalValue || data.assessedValue || 0,
            currency: 'USD',
            name: assetName,
            address: address,
            details: {
              yearBuilt: data.yearBuilt,
              area: data.area,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              lastSold: data.lastSaleDate,
              lastSaleAmount: data.lastSaleAmount
            },
            source: 'Attom Data',
            confidence: 'high'
          });
          return;
        }
      }

      // Fallback to estimate if API key not available or API fails
      const estimate = getPropertyMockEstimate(address, propertyType);
      setPriceData({
        ...estimate,
        name: assetName,
        address: address
      });

      if (!hasApiKey) {
        setError('Please add an Attom API key for accurate property valuations. See .env.example for instructions.');
      }
    } catch (err) {
      // Use mock estimate as fallback
      const estimate = getPropertyMockEstimate(address, propertyType);
      setPriceData({
        ...estimate,
        name: assetName,
        address: address
      });
      setError(hasApiKey ? 'Failed to fetch property data. Please try again.' : estimate.message);
    }
  }, [address, propertyType, assetName]);

  const handleClose = useCallback(() => {
    setStep(1);
    setAssetName('');
    setSymbol('');
    setQuantity('');
    setAddress('');
    setPriceData(null);
    setSearchResults([]);
    setError('');
    onClose();
  }, [onClose]);

  // Save the asset
  const handleSave = useCallback(async () => {
    try {
      let assetData = {
        name: assetName,
        type: accountType,
        auto_update: autoUpdate
      };

      if (detectedType === 'real_estate' && address) {
        // Real estate property
        assetData.asset_type = 'real_estate';
        assetData.quantity = 1;
        assetData.api_provider = process.env.REACT_APP_ATTOM_API_KEY ? 'attom' : 'estimate';
        assetData.last_price = priceData?.price || 0;
        assetData.address = address;
        assetData.property_type = propertyType;
      } else if (detectedType === 'crypto' || detectedType === 'investment') {
        // Stock/ETF/Crypto
        assetData.asset_type = detectedType === 'crypto' ? 'crypto' : 'stock';
        assetData.api_symbol = symbol;
        assetData.api_provider = detectedType === 'crypto' ? 'coingecko' : 'yahoo';
        assetData.quantity = parseFloat(quantity) || 0;
        assetData.last_price = priceData?.price || 0;
      } else {
        // Manual asset
        assetData.asset_type = 'manual';
        assetData.quantity = 1;
        assetData.last_price = priceData?.price || 0;
      }

      await onSave(assetData);
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  }, [assetName, accountType, autoUpdate, detectedType, address, symbol, quantity, priceData, propertyType, onSave, handleClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();

        if (step === 1 && assetName) {
          setStep(2);
        } else if (step === 2) {
          if (detectedType === 'real_estate' && address) {
            getPropertyEstimate();
          } else if (detectedType === 'manual') {
            setStep(3);
          } else if ((detectedType === 'investment' || detectedType === 'crypto') && symbol) {
            handleManualSymbolEntry();
          }
        } else if (step === 3) {
          handleSave();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, step, assetName, address, symbol, detectedType, getPropertyEstimate, handleClose, handleManualSymbolEntry, handleSave]);

  if (!isOpen) return null;

  // Step 1: Asset name and type detection
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add {accountType === 'liability' ? 'Liability' : 'Asset'}</h2>
        <p className="text-sm text-gray-500 mt-1">What would you like to track?</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {accountType === 'liability' ? 'Liability' : 'Asset'} Name
        </label>
        <input
          type="text"
          value={assetName}
          onChange={handleNameChange}
          placeholder={accountType === 'liability' ?
            "e.g., Mortgage, Car Loan, Credit Card" :
            "e.g., House, 401k, Apple Stock, Bitcoin"
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      {assetName && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              {detectedType === 'real_estate' && <Home className="w-6 h-6 text-blue-600" />}
              {detectedType === 'investment' && <TrendingUp className="w-6 h-6 text-blue-600" />}
              {detectedType === 'crypto' && <Coins className="w-6 h-6 text-blue-600" />}
              {detectedType === 'vehicle' && <Car className="w-6 h-6 text-blue-600" />}
              {detectedType === 'retirement' && <PiggyBank className="w-6 h-6 text-blue-600" />}
              {detectedType === 'cash' && <Wallet className="w-6 h-6 text-blue-600" />}
              {(detectedType === 'manual' || !detectedType) && <Search className="w-6 h-6 text-blue-600" />}
            </div>
            <div>
              <div className="font-semibold text-blue-900 capitalize">
                {detectedType === 'manual' || !detectedType ? 'Manual Entry' : detectedType.replace('_', ' ')}
              </div>
              <div className="text-sm text-blue-700">
                {detectedType === 'real_estate' && 'Property with automatic valuation'}
                {detectedType === 'investment' && 'Stock, ETF, or investment account'}
                {detectedType === 'crypto' && 'Cryptocurrency with live prices'}
                {detectedType === 'vehicle' && 'Car, truck, or other vehicle'}
                {detectedType === 'retirement' && '401k, IRA, or retirement account'}
                {detectedType === 'cash' && 'Cash savings or checking account'}
                {(detectedType === 'manual' || !detectedType) && 'Manual value entry'}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setStep(2)}
        disabled={!assetName}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Continue
      </button>
    </div>
  );

  // Step 2: Detailed input based on type
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Details</h2>
          <p className="text-sm text-gray-500 mt-1">Provide more information</p>
        </div>
        <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {detectedType === 'real_estate' && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter the full address for accurate valuation</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="residential">Residential Home</option>
              <option value="commercial">Commercial Property</option>
              <option value="land">Land</option>
              <option value="rental">Rental Property</option>
              <option value="condo">Condominium</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>

          <button
            onClick={getPropertyEstimate}
            disabled={!address}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Value Estimate
          </button>
        </>
      )}

      {(detectedType === 'investment' || detectedType === 'crypto') && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {detectedType === 'crypto' ? 'Cryptocurrency' : 'Stock/ETF'} Symbol
            </label>
            <div className="text-sm text-gray-500 mb-2">
              {detectedType === 'crypto' ?
                'Enter the cryptocurrency ID (e.g., bitcoin, ethereum)' :
                'Enter the stock symbol (e.g., AAPL, GOOGL, VTI)'
              }
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  if (e.target.value.length >= 2) {
                    handleSearch(e.target.value);
                  } else {
                    setSearchResults([]);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && symbol) {
                    handleManualSymbolEntry();
                  }
                }}
                placeholder={detectedType === 'crypto' ?
                  "bitcoin, ethereum, cardano..." :
                  "AAPL, GOOGL, VTI, TSLA..."
                }
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAsset(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{(result.symbol || result.id?.toUpperCase())}</div>
                  <div className="text-sm text-gray-500">{result.name}</div>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && symbol && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                Using symbol: <span className="font-mono font-semibold">{symbol.toUpperCase()}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleManualSymbolEntry}
            disabled={!symbol}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Current Price
          </button>
        </>
      )}

      {detectedType === 'manual' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Value
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-lg text-gray-500">$</span>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setPriceData({ price: parseFloat(e.target.value) || 0, currency: 'USD' });
              }}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter the current value of this asset</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  // Step 3: Review and confirm
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
        <p className="text-sm text-gray-500 mt-1">Please review the details before adding</p>
      </div>

      <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl space-y-4 border border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">Name:</span>
          <span className="font-medium">{assetName}</span>
        </div>

        {detectedType !== 'manual' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Symbol:</span>
            <span className="font-medium">{symbol || address}</span>
          </div>
        )}

        {detectedType === 'real_estate' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Address:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{address}</span>
                <button
                  onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={showPropertyDetails ? "Hide details" : "Show details"}
                >
                  {showPropertyDetails ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>

            {showPropertyDetails && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Property Details</h4>
                {priceData?.details ? (
                  <>
                    {priceData.details.yearBuilt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Year Built:</span>
                        <span className="font-medium">{priceData.details.yearBuilt}</span>
                      </div>
                    )}
                    {priceData.details.area && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Square Feet:</span>
                        <span className="font-medium">{priceData.details.area.toLocaleString()}</span>
                      </div>
                    )}
                    {(priceData.details.bedrooms || priceData.details.bathrooms) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bedrooms/Bathrooms:</span>
                        <span className="font-medium">
                          {priceData.details.bedrooms || 0} / {priceData.details.bathrooms || 0}
                        </span>
                      </div>
                    )}
                    {priceData.details.lastSold && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Sale:</span>
                        <span className="font-medium">
                          {priceData.details.lastSold} - ${priceData.details.lastSaleAmount?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium capitalize">{propertyType.replace('_', ' ')}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No additional details available</p>
                )}
              </div>
            )}
          </div>
        )}

        {priceData && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-medium">${priceData.price.toLocaleString()}</span>
            </div>
            {priceData.source && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Data Source:</span>
                <span className="text-gray-500 text-xs">{priceData.source}</span>
              </div>
            )}
            {priceData.confidence === 'low' && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                This is a rough estimate. Add an API key for accurate valuations.
              </div>
            )}
          </>
        )}

        {(detectedType === 'investment' || detectedType === 'crypto') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {detectedType === 'crypto' ? 'Number of Coins' : 'Number of Shares'}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              step="0.000001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {quantity && priceData?.price && (
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-900 font-medium">Total Value:</span>
            <span className="font-bold text-lg text-blue-600">
              ${(parseFloat(quantity) * parseFloat(priceData.price)).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {detectedType !== 'manual' && detectedType !== 'real_estate' && (
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
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          Add {accountType === 'liability' ? 'Liability' : 'Asset'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </button>

        <div className="mt-2">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default SmartAssetModal;