import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Hook for managing cashflow data (income and expenses)
 */
export const useCashflowData = (selectedYear) => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { currency, convertCurrency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawCashflowData, setRawCashflowData] = useState({
    income: {},
    expenses: {},
    goals: {
      savingsTarget: 20,
      emergencyFund: 10000
    }
  });

  const [cashflowData, setCashflowData] = useState({
    income: {},
    expenses: {},
    goals: {
      savingsTarget: 20,
      emergencyFund: 10000
    }
  });

  // Default categories - these can be hidden but not permanently deleted
  const defaultIncomeCategories = useMemo(() => [
    { name: 'Salary', icon: '💼', isDefault: true },
    { name: 'Freelance', icon: '💻', isDefault: true },
    { name: 'Investments', icon: '📈', isDefault: true },
    { name: 'Other', icon: '💰', isDefault: true }
  ], []);

  const defaultExpenseCategories = useMemo(() => [
    { name: 'Housing', icon: '🏠', isDefault: true },
    { name: 'Transport', icon: '🚗', isDefault: true },
    { name: 'Food', icon: '🍔', isDefault: true },
    { name: 'Utilities', icon: '⚡', isDefault: true },
    { name: 'Entertainment', icon: '🎮', isDefault: true },
    { name: 'Healthcare', icon: '🏥', isDefault: true },
    { name: 'Shopping', icon: '🛒', isDefault: true },
    { name: 'Insurance', icon: '🛡️', isDefault: true },
    { name: 'Other', icon: '📦', isDefault: true }
  ], []);

  // Track hidden default categories
  const [hiddenCategories, setHiddenCategories] = useState(() => {
    const stored = localStorage.getItem('hiddenCashflowCategories');
    return stored ? JSON.parse(stored) : { income: [], expenses: [] };
  });

  // Get visible categories (excluding hidden defaults)
  const incomeCategories = useMemo(() =>
    defaultIncomeCategories.filter(cat => !hiddenCategories.income.includes(cat.name)),
    [defaultIncomeCategories, hiddenCategories]
  );

  const expenseCategories = useMemo(() =>
    defaultExpenseCategories.filter(cat => !hiddenCategories.expenses.includes(cat.name)),
    [defaultExpenseCategories, hiddenCategories]
  );

  // Convert raw cashflow data to display currency
  const convertCashflowData = useCallback(async (rawData, displayCurrency) => {
    if (!rawData || !rawData.income || !rawData.expenses) {
      return rawData;
    }

    const convertedData = {
      income: {},
      expenses: {},
      goals: rawData.goals || { savingsTarget: 20, emergencyFund: 10000 }
    };

    // Convert income data
    for (const [category, monthlyData] of Object.entries(rawData.income)) {
      if (Array.isArray(monthlyData)) {
        convertedData.income[category] = await Promise.all(
          monthlyData.map(async (monthValue) => {
            if (typeof monthValue === 'object' && monthValue !== null) {
              // New format with currency info
              const originalValue = monthValue.original_value || monthValue.value || 0;
              const originalCurrency = monthValue.original_currency || displayCurrency;
              return await convertCurrency(originalValue, originalCurrency, displayCurrency);
            }
            // Legacy format - assume it's in display currency
            return monthValue || 0;
          })
        );
      } else {
        convertedData.income[category] = monthlyData;
      }
    }

    // Convert expenses data
    for (const [category, monthlyData] of Object.entries(rawData.expenses)) {
      if (Array.isArray(monthlyData)) {
        convertedData.expenses[category] = await Promise.all(
          monthlyData.map(async (monthValue) => {
            if (typeof monthValue === 'object' && monthValue !== null) {
              // New format with currency info
              const originalValue = monthValue.original_value || monthValue.value || 0;
              const originalCurrency = monthValue.original_currency || displayCurrency;
              return await convertCurrency(originalValue, originalCurrency, displayCurrency);
            }
            // Legacy format - assume it's in display currency
            return monthValue || 0;
          })
        );
      } else {
        convertedData.expenses[category] = monthlyData;
      }
    }

    return convertedData;
  }, [convertCurrency]);

  // Initialize empty data structure for a year
  const initializeYearData = useCallback(() => {
    const income = {};
    const expenses = {};

    incomeCategories.forEach(cat => {
      income[cat.name] = new Array(12).fill(0);
    });

    expenseCategories.forEach(cat => {
      expenses[cat.name] = new Array(12).fill(0);
    });

    return { income, expenses };
  }, [incomeCategories, expenseCategories]);

  // Load cashflow data
  const loadCashflowData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemo) {
        // Load demo data from localStorage
        const storedDemoData = localStorage.getItem('demoCashflowData');
        if (storedDemoData) {
          const parsed = JSON.parse(storedDemoData);
          if (parsed[selectedYear]) {
            setRawCashflowData(parsed[selectedYear]);
          } else {
            // Initialize with sample data for demo
            const newData = initializeYearData();
            // Add some sample demo data
            newData.income['Salary'] = [8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500];
            newData.income['Freelance'] = [1200, 800, 1500, 900, 1100, 1300, 1000, 1400, 1200, 1600, 1800, 2000];
            newData.expenses['Housing'] = [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500];
            newData.expenses['Food'] = [800, 850, 780, 920, 870, 810, 890, 860, 830, 900, 880, 850];
            newData.expenses['Transport'] = [400, 420, 380, 410, 390, 420, 400, 430, 410, 420, 400, 390];
            newData.expenses['Utilities'] = [250, 280, 260, 240, 230, 220, 230, 240, 250, 260, 270, 280];
            setRawCashflowData({ ...newData, goals: { savingsTarget: 20, emergencyFund: 10000 } });
          }
        } else {
          // Initialize with sample data for demo
          const newData = initializeYearData();
          // Add some sample demo data
          newData.income['Salary'] = [8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500];
          newData.income['Freelance'] = [1200, 800, 1500, 900, 1100, 1300, 1000, 1400, 1200, 1600, 1800, 2000];
          newData.expenses['Housing'] = [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500];
          newData.expenses['Food'] = [800, 850, 780, 920, 870, 810, 890, 860, 830, 900, 880, 850];
          newData.expenses['Transport'] = [400, 420, 380, 410, 390, 420, 400, 430, 410, 420, 400, 390];
          newData.expenses['Utilities'] = [250, 280, 260, 240, 230, 220, 230, 240, 250, 260, 270, 280];
          setCashflowData({ ...newData, goals: { savingsTarget: 20, emergencyFund: 10000 } });
        }
      } else if (user) {
        // Load from Supabase
        const { data, error: fetchError } = await supabase
          .from('cashflow')
          .select('*')
          .eq('user_id', user.id)
          .eq('year', selectedYear)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
          throw fetchError;
        }

        if (data) {
          setRawCashflowData({
            income: data.income || {},
            expenses: data.expenses || {},
            goals: data.goals || { savingsTarget: 20, emergencyFund: 10000 }
          });
        } else {
          // Initialize empty data
          const newData = initializeYearData();
          setRawCashflowData({ ...newData, goals: { savingsTarget: 20, emergencyFund: 10000 } });
        }
      }
    } catch (err) {
      console.error('Error loading cashflow data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, user, isDemo, initializeYearData]);

  // Save cashflow data
  const saveCashflowData = useCallback(async (category, type, monthIndex, value) => {
    try {
      const numericValue = parseFloat(value) || 0;

      // Update raw data with currency information
      setRawCashflowData(prev => {
        const newData = { ...prev };

        // Store value with currency metadata for new entries
        const valueWithCurrency = {
          original_value: numericValue,
          original_currency: currency,
          value: numericValue // For legacy compatibility
        };

        if (type === 'income') {
          if (!newData.income[category]) {
            newData.income[category] = new Array(12).fill(0);
          }
          newData.income[category][monthIndex] = valueWithCurrency;
        } else {
          if (!newData.expenses[category]) {
            newData.expenses[category] = new Array(12).fill(0);
          }
          newData.expenses[category][monthIndex] = valueWithCurrency;
        }

        // Save to storage
        if (isDemo) {
          // Save to localStorage for demo
          const storedData = localStorage.getItem('demoCashflowData') || '{}';
          const allData = JSON.parse(storedData);
          allData[selectedYear] = newData;
          localStorage.setItem('demoCashflowData', JSON.stringify(allData));
        } else if (user) {
          // Save to Supabase (debounced)
          saveToDatabaseDebounced(newData);
        }

        return newData;
      });

      return true;
    } catch (err) {
      console.error('Error saving cashflow data:', err);
      setError(err.message);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, user, isDemo, currency]);

  // Debounced save to database
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToDatabaseDebounced = useCallback(
    debounce(async (data) => {
      if (!user) return;

      try {
        const { error: upsertError } = await supabase
          .from('cashflow')
          .upsert({
            user_id: user.id,
            year: selectedYear,
            income: data.income,
            expenses: data.expenses,
            goals: data.goals,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,year'
          });

        if (upsertError) throw upsertError;
      } catch (err) {
        console.error('Error saving to database:', err);
        setError(err.message);
      }
    }, 1000),
    [selectedYear, user]
  );

  // Update goals
  const updateGoals = useCallback((newGoals) => {
    setRawCashflowData(prev => {
      const newData = { ...prev, goals: { ...prev.goals, ...newGoals } };

      if (isDemo) {
        const storedData = localStorage.getItem('demoCashflowData') || '{}';
        const allData = JSON.parse(storedData);
        allData[selectedYear] = newData;
        localStorage.setItem('demoCashflowData', JSON.stringify(allData));
      } else if (user) {
        saveToDatabaseDebounced(newData);
      }

      return newData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, user, isDemo]);

  // Calculate totals and metrics for a specific month
  const calculateMetrics = useCallback((selectedMonth = null) => {
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    let totalIncome = 0;
    let totalExpenses = 0;

    // Calculate monthly totals
    for (let month = 0; month < 12; month++) {
      Object.values(cashflowData.income || {}).forEach(categoryData => {
        if (Array.isArray(categoryData)) {
          monthlyIncome[month] += categoryData[month] || 0;
        }
      });

      Object.values(cashflowData.expenses || {}).forEach(categoryData => {
        if (Array.isArray(categoryData)) {
          monthlyExpenses[month] += categoryData[month] || 0;
        }
      });

      totalIncome += monthlyIncome[month];
      totalExpenses += monthlyExpenses[month];
    }

    const netCashflow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

    // Calculate YTD (up to current month)
    const currentMonth = new Date().getMonth();
    let ytdIncome = 0;
    let ytdExpenses = 0;
    for (let i = 0; i <= currentMonth; i++) {
      ytdIncome += monthlyIncome[i];
      ytdExpenses += monthlyExpenses[i];
    }

    // If selectedMonth is provided, also return that month's specific data
    let monthSpecific = {};
    if (selectedMonth !== null) {
      const monthIncome = monthlyIncome[selectedMonth];
      const monthExpenses = monthlyExpenses[selectedMonth];
      monthSpecific = {
        monthIncome,
        monthExpenses,
        monthNetCashflow: monthIncome - monthExpenses,
        monthSavingsRate: monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome * 100) : 0
      };
    }

    return {
      totalIncome,
      totalExpenses,
      netCashflow,
      savingsRate,
      monthlyIncome,
      monthlyExpenses,
      monthlyNetCashflow: monthlyIncome.map((income, i) => income - monthlyExpenses[i]),
      ytdIncome,
      ytdExpenses,
      ytdNetCashflow: ytdIncome - ytdExpenses,
      ytdSavingsRate: ytdIncome > 0 ? ((ytdIncome - ytdExpenses) / ytdIncome * 100) : 0,
      ...monthSpecific
    };
  }, [cashflowData]);

  // Copy previous month's data
  const copyPreviousMonth = useCallback((monthIndex) => {
    if (monthIndex === 0) return false;

    const prevMonth = monthIndex - 1;
    setRawCashflowData(prev => {
      const newData = { ...prev };

      // Copy income
      Object.keys(newData.income).forEach(category => {
        if (Array.isArray(newData.income[category])) {
          newData.income[category][monthIndex] = newData.income[category][prevMonth];
        }
      });

      // Copy expenses
      Object.keys(newData.expenses).forEach(category => {
        if (Array.isArray(newData.expenses[category])) {
          newData.expenses[category][monthIndex] = newData.expenses[category][prevMonth];
        }
      });

      if (isDemo) {
        const storedData = localStorage.getItem('demoCashflowData') || '{}';
        const allData = JSON.parse(storedData);
        allData[selectedYear] = newData;
        localStorage.setItem('demoCashflowData', JSON.stringify(allData));
      } else if (user) {
        saveToDatabaseDebounced(newData);
      }

      return newData;
    });

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, user, isDemo]);

  // Add new category
  const addCategory = useCallback((type, categoryName, icon = '📦') => {
    if (!categoryName.trim()) return false;

    const newCategory = { name: categoryName.trim(), icon };

    if (type === 'income') {
      // Check if category already exists
      if (incomeCategories.some(cat => cat.name === newCategory.name)) {
        return false;
      }

      setRawCashflowData(prev => {
        const newData = { ...prev };
        if (!newData.income[newCategory.name]) {
          newData.income[newCategory.name] = new Array(12).fill(0);
        }
        return newData;
      });
    } else {
      // Check if category already exists
      if (expenseCategories.some(cat => cat.name === newCategory.name)) {
        return false;
      }

      setRawCashflowData(prev => {
        const newData = { ...prev };
        if (!newData.expenses[newCategory.name]) {
          newData.expenses[newCategory.name] = new Array(12).fill(0);
        }
        return newData;
      });
    }

    // Add to categories list
    if (type === 'income') {
      // For demo purposes, we'll store custom categories in localStorage
      const customCategories = JSON.parse(localStorage.getItem('customIncomeCategories') || '[]');
      customCategories.push(newCategory);
      localStorage.setItem('customIncomeCategories', JSON.stringify(customCategories));
    } else {
      const customCategories = JSON.parse(localStorage.getItem('customExpenseCategories') || '[]');
      customCategories.push(newCategory);
      localStorage.setItem('customExpenseCategories', JSON.stringify(customCategories));
    }

    return true;
  }, [incomeCategories, expenseCategories]);

  // Delete category - hides default categories, removes custom ones
  const deleteCategory = useCallback((type, categoryName) => {
    // Check if this is a default category
    const isDefault = type === 'income'
      ? defaultIncomeCategories.some(cat => cat.name === categoryName)
      : defaultExpenseCategories.some(cat => cat.name === categoryName);

    // Delete data from storage
    setRawCashflowData(prev => {
      const newData = { ...prev };

      if (type === 'income') {
        delete newData.income[categoryName];
      } else {
        delete newData.expenses[categoryName];
      }

      // Save to storage
      if (isDemo) {
        const storedData = localStorage.getItem('demoCashflowData') || '{}';
        const allData = JSON.parse(storedData);
        allData[selectedYear] = newData;
        localStorage.setItem('demoCashflowData', JSON.stringify(allData));
      } else if (user) {
        saveToDatabaseDebounced(newData);
      }

      return newData;
    });

    if (isDefault) {
      // Hide default category instead of deleting
      setHiddenCategories(prev => {
        const newHidden = { ...prev };
        if (type === 'income') {
          newHidden.income = [...newHidden.income, categoryName];
        } else {
          newHidden.expenses = [...newHidden.expenses, categoryName];
        }
        localStorage.setItem('hiddenCashflowCategories', JSON.stringify(newHidden));
        return newHidden;
      });
    } else {
      // Remove custom category completely
      if (type === 'income') {
        const customCategories = JSON.parse(localStorage.getItem('customIncomeCategories') || '[]');
        const filtered = customCategories.filter(cat => cat.name !== categoryName);
        localStorage.setItem('customIncomeCategories', JSON.stringify(filtered));
      } else {
        const customCategories = JSON.parse(localStorage.getItem('customExpenseCategories') || '[]');
        const filtered = customCategories.filter(cat => cat.name !== categoryName);
        localStorage.setItem('customExpenseCategories', JSON.stringify(filtered));
      }
    }

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, user, isDemo, defaultIncomeCategories, defaultExpenseCategories]);

  // Load custom categories
  const getAllCategories = useCallback((type) => {
    const baseCategories = type === 'income' ? incomeCategories : expenseCategories;
    const customKey = type === 'income' ? 'customIncomeCategories' : 'customExpenseCategories';
    const customCategories = JSON.parse(localStorage.getItem(customKey) || '[]');

    return [...baseCategories, ...customCategories];
  }, [incomeCategories, expenseCategories]);

  // Load data on mount and when year changes
  useEffect(() => {
    loadCashflowData();
  }, [loadCashflowData]);

  // Convert data when currency changes
  useEffect(() => {
    const convertData = async () => {
      if (rawCashflowData && (rawCashflowData.income || rawCashflowData.expenses)) {
        try {
          const converted = await convertCashflowData(rawCashflowData, currency);
          setCashflowData(converted);
        } catch (err) {
          console.error('Error converting currency:', err);
          // Fallback to raw data if conversion fails
          setCashflowData(rawCashflowData);
        }
      }
    };

    convertData();
  }, [currency, rawCashflowData, convertCashflowData]);

  return {
    loading,
    error,
    cashflowData,
    incomeCategories: getAllCategories('income'),
    expenseCategories: getAllCategories('expenses'),
    saveCashflowData,
    updateGoals,
    calculateMetrics,
    copyPreviousMonth,
    addCategory,
    deleteCategory,
    reload: loadCashflowData
  };
};

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}