// Currency configuration and utilities

// Popular currencies with their symbols and formatting
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD', locale: 'en-US', position: 'before' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR', locale: 'de-DE', position: 'before' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP', locale: 'en-GB', position: 'before' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY', locale: 'ja-JP', position: 'before', decimals: 0 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY', locale: 'zh-CN', position: 'before' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR', locale: 'en-IN', position: 'before' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD', locale: 'en-AU', position: 'before' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD', locale: 'en-CA', position: 'before' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', code: 'CHF', locale: 'de-CH', position: 'before' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', code: 'SEK', locale: 'sv-SE', position: 'after' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', code: 'NOK', locale: 'nb-NO', position: 'after' },
  DKK: { symbol: 'kr', name: 'Danish Krone', code: 'DKK', locale: 'da-DK', position: 'after' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD', locale: 'en-SG', position: 'before' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', code: 'HKD', locale: 'zh-HK', position: 'before' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', code: 'NZD', locale: 'en-NZ', position: 'before' },
  ZAR: { symbol: 'R', name: 'South African Rand', code: 'ZAR', locale: 'en-ZA', position: 'before' },
  MXN: { symbol: '$', name: 'Mexican Peso', code: 'MXN', locale: 'es-MX', position: 'before' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', code: 'BRL', locale: 'pt-BR', position: 'before' },
  RUB: { symbol: '₽', name: 'Russian Ruble', code: 'RUB', locale: 'ru-RU', position: 'after' },
  KRW: { symbol: '₩', name: 'South Korean Won', code: 'KRW', locale: 'ko-KR', position: 'before', decimals: 0 },
  THB: { symbol: '฿', name: 'Thai Baht', code: 'THB', locale: 'th-TH', position: 'before' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', code: 'MYR', locale: 'ms-MY', position: 'before' },
  PHP: { symbol: '₱', name: 'Philippine Peso', code: 'PHP', locale: 'en-PH', position: 'before' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', code: 'IDR', locale: 'id-ID', position: 'before', decimals: 0 },
  VND: { symbol: '₫', name: 'Vietnamese Dong', code: 'VND', locale: 'vi-VN', position: 'after', decimals: 0 },
  TRY: { symbol: '₺', name: 'Turkish Lira', code: 'TRY', locale: 'tr-TR', position: 'before' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED', locale: 'ar-AE', position: 'before' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', code: 'SAR', locale: 'ar-SA', position: 'before' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', code: 'NGN', locale: 'en-NG', position: 'before' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', code: 'EGP', locale: 'ar-EG', position: 'before' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee', code: 'PKR', locale: 'ur-PK', position: 'before' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', code: 'BDT', locale: 'bn-BD', position: 'before' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', code: 'KES', locale: 'en-KE', position: 'before' }
};

// Default currency (can be overridden by user preference)
export const DEFAULT_CURRENCY = 'USD';

// Get user's currency preference from localStorage
export const getUserCurrency = () => {
  const saved = localStorage.getItem('userCurrency');
  return saved && CURRENCIES[saved] ? saved : DEFAULT_CURRENCY;
};

// Save user's currency preference to localStorage
export const setUserCurrency = (currencyCode) => {
  if (CURRENCIES[currencyCode]) {
    localStorage.setItem('userCurrency', currencyCode);
    // Dispatch custom event to notify components of currency change
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currencyCode }));
    return true;
  }
  return false;
};

// Format currency with proper locale and settings
export const formatCurrency = (amount, currencyCode = null, options = {}) => {
  const code = currencyCode || getUserCurrency();
  const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  
  const formatOptions = {
    style: 'currency',
    currency: code,
    minimumFractionDigits: options.decimals !== undefined ? options.decimals : (currency.decimals !== undefined ? currency.decimals : 0),
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : (currency.decimals !== undefined ? currency.decimals : 0),
    ...options
  };

  try {
    return new Intl.NumberFormat(currency.locale, formatOptions).format(amount);
  } catch (error) {
    // Fallback to basic formatting if Intl fails
    console.warn('Currency formatting failed, using fallback', error);
    const symbol = currency.symbol;
    const formattedAmount = Number(amount).toFixed(formatOptions.minimumFractionDigits);
    return currency.position === 'before' ? `${symbol}${formattedAmount}` : `${formattedAmount} ${symbol}`;
  }
};

// Format currency for display in charts (shortened format)
export const formatCurrencyShort = (amount, currencyCode = null) => {
  const code = currencyCode || getUserCurrency();
  const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  
  const absAmount = Math.abs(amount);
  let suffix = '';
  let divisor = 1;
  
  if (absAmount >= 1000000000) {
    suffix = 'B';
    divisor = 1000000000;
  } else if (absAmount >= 1000000) {
    suffix = 'M';
    divisor = 1000000;
  } else if (absAmount >= 1000) {
    suffix = 'k';
    divisor = 1000;
  }
  
  const shortAmount = amount / divisor;
  const decimals = suffix ? 1 : 0;
  
  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(shortAmount);
    
    return suffix ? formatted.replace(/[^\d.,\-\s]/g, '').trim() + suffix : formatted;
  } catch (error) {
    const symbol = currency.symbol;
    const formattedAmount = shortAmount.toFixed(decimals) + suffix;
    return currency.position === 'before' ? `${symbol}${formattedAmount}` : `${formattedAmount} ${symbol}`;
  }
};

// Get currency symbol only
export const getCurrencySymbol = (currencyCode = null) => {
  const code = currencyCode || getUserCurrency();
  const currency = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  return currency.symbol;
};

// Parse currency string to number (removes currency symbols and formatting)
export const parseCurrencyToNumber = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;
  if (!currencyString) return 0;
  
  // Remove all non-numeric characters except decimal point and minus sign
  const cleanedString = currencyString.toString()
    .replace(/[^\d.,-]/g, '')
    .replace(/,/g, '');
  
  return parseFloat(cleanedString) || 0;
};

// Cache for exchange rates (5 minutes TTL)
const EXCHANGE_RATE_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get exchange rates from API (using exchangerate-api.com free tier)
export const getExchangeRates = async (baseCurrency = 'USD') => {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = EXCHANGE_RATE_CACHE.get(cacheKey);
  
  // Check cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rates;
  }
  
  try {
    // Using exchangerate-api.com free tier (1500 requests/month)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    // Cache the results
    EXCHANGE_RATE_CACHE.set(cacheKey, {
      rates: data.rates,
      timestamp: Date.now()
    });
    
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return cached data even if expired, as fallback
    if (cached) {
      return cached.rates;
    }
    
    // Last resort: return null to indicate failure
    return null;
  }
};

// Convert currency with real-time exchange rates
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  try {
    const rates = await getExchangeRates(fromCurrency);
    
    if (!rates || !rates[toCurrency]) {
      console.warn(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      return amount;
    }
    
    return amount * rates[toCurrency];
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
};

// Get exchange rate between two currencies
export const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  try {
    const rates = await getExchangeRates(fromCurrency);
    return rates && rates[toCurrency] ? rates[toCurrency] : null;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return null;
  }
};

// Convert amount to user's base currency for storage
export const convertToBaseCurrency = async (amount, fromCurrency, baseCurrency = getUserCurrency()) => {
  return convertCurrency(amount, fromCurrency, baseCurrency);
};

// Clear exchange rate cache
export const clearExchangeRateCache = () => {
  EXCHANGE_RATE_CACHE.clear();
};

// Get list of currencies for dropdown
export const getCurrencyList = () => {
  return Object.entries(CURRENCIES).map(([code, currency]) => ({
    code,
    label: `${currency.symbol} ${code} - ${currency.name}`,
    symbol: currency.symbol,
    name: currency.name
  }));
};

// Check if browser supports currency
export const isCurrencySupported = (currencyCode) => {
  try {
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode });
    return true;
  } catch (e) {
    return false;
  }
};