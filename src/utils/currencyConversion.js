// Enhanced currency conversion utilities for proper multi-currency support
import { getExchangeRates, getUserCurrency, CURRENCIES } from './currency';

// Cache for storing exchange rates with timestamps
const CONVERSION_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached or fresh exchange rates
 */
const getCachedExchangeRates = async (baseCurrency) => {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = CONVERSION_CACHE.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rates;
  }
  
  const rates = await getExchangeRates(baseCurrency);
  if (rates) {
    CONVERSION_CACHE.set(cacheKey, {
      rates,
      timestamp: Date.now()
    });
  }
  
  return rates;
};

/**
 * Convert a value from one currency to another
 * @param {number} value - The value to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted value
 */
export const convertValue = async (value, fromCurrency, toCurrency) => {
  if (!value || value === 0) return 0;
  if (fromCurrency === toCurrency) return value;
  
  try {
    const rates = await getCachedExchangeRates(fromCurrency);
    if (!rates || !rates[toCurrency]) {
      console.warn(`No exchange rate available for ${fromCurrency} to ${toCurrency}`);
      return value;
    }
    
    return value * rates[toCurrency];
  } catch (error) {
    console.error('Conversion error:', error);
    return value;
  }
};


/**
 * Convert multiple values in batch
 * @param {Array} items - Array of {value, originalCurrency} objects
 * @param {string} targetCurrency - Target currency code
 * @returns {Promise<Array>} Array of converted values
 */
export const batchConvertValues = async (items, targetCurrency) => {
  // Group by source currency to minimize API calls
  const grouped = items.reduce((acc, item) => {
    const currency = item.originalCurrency || getUserCurrency();
    if (!acc[currency]) acc[currency] = [];
    acc[currency].push(item);
    return acc;
  }, {});
  
  const results = [];
  
  for (const [fromCurrency, group] of Object.entries(grouped)) {
    if (fromCurrency === targetCurrency) {
      results.push(...group.map(item => item.value));
      continue;
    }
    
    const rates = await getCachedExchangeRates(fromCurrency);
    const rate = rates?.[targetCurrency] || 1;
    
    results.push(...group.map(item => item.value * rate));
  }
  
  return results;
};

/**
 * Create a data structure with original and converted values
 * @param {number} value - The value to store
 * @param {string} currency - The currency of the value
 * @param {Date} date - The date when the value was entered
 * @returns {Object} Data structure with original and display values
 */
export const createCurrencyData = (value, currency = null, date = new Date()) => {
  return {
    originalValue: value,
    originalCurrency: currency || getUserCurrency(),
    entryDate: date.toISOString(),
    displayValue: value, // Will be updated when converting
    displayCurrency: currency || getUserCurrency()
  };
};

/**
 * Update display values for currency data
 * @param {Object} data - Currency data object
 * @param {string} targetCurrency - Target currency for display
 * @returns {Promise<Object>} Updated currency data
 */
export const updateDisplayCurrency = async (data, targetCurrency) => {
  if (!data || !data.originalValue) {
    return data;
  }
  
  const convertedValue = await convertValue(
    data.originalValue,
    data.originalCurrency,
    targetCurrency
  );
  
  return {
    ...data,
    displayValue: convertedValue,
    displayCurrency: targetCurrency
  };
};

/**
 * Migrate existing data to new currency structure
 * @param {number} value - Existing value
 * @param {string} assumedCurrency - Currency to assume for existing data
 * @returns {Object} Migrated currency data
 */
export const migrateExistingValue = (value, assumedCurrency = null) => {
  // Get the last saved currency from localStorage or use default
  const lastCurrency = assumedCurrency || localStorage.getItem('lastKnownCurrency') || getUserCurrency();
  
  return createCurrencyData(value, lastCurrency, new Date());
};

/**
 * Store the current currency as the last known currency
 * Used for migration purposes
 */
export const saveLastKnownCurrency = (currency) => {
  localStorage.setItem('lastKnownCurrency', currency);
};

/**
 * Get conversion indicator text
 * @param {Object} data - Currency data object
 * @returns {string} Indicator text
 */
export const getConversionIndicator = (data) => {
  if (!data || data.originalCurrency === data.displayCurrency) {
    return '';
  }
  
  const originalSymbol = CURRENCIES[data.originalCurrency]?.symbol || data.originalCurrency;
  const formattedOriginal = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(data.originalValue);
  
  return `Originally ${originalSymbol}${formattedOriginal}`;
};

/**
 * Clear all conversion caches
 */
export const clearConversionCache = () => {
  CONVERSION_CACHE.clear();
};

// Export cache for debugging
export const getConversionCache = () => CONVERSION_CACHE;