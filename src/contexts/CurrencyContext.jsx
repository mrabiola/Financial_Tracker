import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getUserCurrency, 
  setUserCurrency as saveUserCurrency, 
  formatCurrency as formatCurrencyUtil,
  formatCurrencyShort as formatCurrencyShortUtil,
  getCurrencySymbol as getCurrencySymbolUtil,
  convertCurrency as convertCurrencyUtil,
  getExchangeRate as getExchangeRateUtil,
  getExchangeRates as getExchangeRatesUtil,
  CURRENCIES,
  DEFAULT_CURRENCY 
} from '../utils/currency';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(getUserCurrency());
  const [currencyDetails, setCurrencyDetails] = useState(CURRENCIES[getUserCurrency()] || CURRENCIES[DEFAULT_CURRENCY]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);

  // Fetch exchange rates for the current currency
  const fetchExchangeRates = useCallback(async (baseCurrency) => {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const rates = await getExchangeRatesUtil(baseCurrency);
      if (rates) {
        setExchangeRates(rates);
      } else {
        setRatesError('Failed to fetch exchange rates');
      }
    } catch (error) {
      setRatesError(error.message);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    // Update currency details when currency changes
    setCurrencyDetails(CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY]);
    // Fetch new exchange rates when currency changes
    fetchExchangeRates(currency);
  }, [currency, fetchExchangeRates]);

  useEffect(() => {
    // Listen for currency changes from other tabs/windows
    const handleCurrencyChange = (event) => {
      setCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const updateCurrency = (newCurrency) => {
    if (CURRENCIES[newCurrency]) {
      saveUserCurrency(newCurrency);
      setCurrency(newCurrency);
      return true;
    }
    return false;
  };

  const formatCurrency = (amount, options = {}) => {
    return formatCurrencyUtil(amount, currency, options);
  };

  const formatCurrencyShort = (amount) => {
    return formatCurrencyShortUtil(amount, currency);
  };

  const getCurrencySymbol = () => {
    return getCurrencySymbolUtil(currency);
  };

  // Convert currency with real-time rates
  const convertCurrency = async (amount, fromCurrency, toCurrency = currency) => {
    return convertCurrencyUtil(amount, fromCurrency, toCurrency);
  };

  // Get exchange rate between currencies
  const getExchangeRate = async (fromCurrency, toCurrency = currency) => {
    return getExchangeRateUtil(fromCurrency, toCurrency);
  };

  // Convert and format currency in one step
  const convertAndFormat = async (amount, fromCurrency, toCurrency = currency, options = {}) => {
    const converted = await convertCurrency(amount, fromCurrency, toCurrency);
    return formatCurrencyUtil(converted, toCurrency, options);
  };

  const value = {
    currency,
    currencyDetails,
    updateCurrency,
    formatCurrency,
    formatCurrencyShort,
    getCurrencySymbol,
    currencies: CURRENCIES,
    convertCurrency,
    getExchangeRate,
    convertAndFormat,
    exchangeRates,
    ratesLoading,
    ratesError,
    refreshRates: () => fetchExchangeRates(currency)
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};