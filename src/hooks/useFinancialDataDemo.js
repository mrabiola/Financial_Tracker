import { useState, useEffect, useCallback, useRef } from 'react';
// import { useAuth } from '../contexts/AuthContext'; // Reserved for future use
import { useDemo } from '../contexts/DemoContext';
import { useFinancialDataWithCurrency } from './useFinancialDataWithCurrency';

/**
 * Wrapper hook that handles both demo and real financial data
 */
export const useFinancialDataDemo = (selectedYear) => {
  // const { user } = useAuth(); // Reserved for future use
  const {
    isDemo,
    demoData,
    updateDemoData,
    loading: demoLoading
  } = useDemo();

  // Cache for demo multi-year data to prevent repeated generation
  const demoFetchCache = useRef({});
  
  // Use real data hook when authenticated
  const realDataHook = useFinancialDataWithCurrency(selectedYear);
  
  // State for demo mode
  const [demoState, setDemoState] = useState({
    loading: true,
    error: null,
    yearData: null,
    accounts: { assets: [], liabilities: [] },
    goals: [],
    snapshots: {},
    snapshotsCurrency: {}
  });

  // Load demo data when in demo mode, filtering by selected year
  useEffect(() => {
    if (isDemo && demoData) {
      // Clear the multi-year cache when demo data changes to ensure fresh data
      demoFetchCache.current = {};
      // Filter snapshots by selected year
      const yearFilteredSnapshots = {};
      if (demoData.snapshots) {
        Object.keys(demoData.snapshots).forEach(accountId => {
          yearFilteredSnapshots[accountId] = {};
          Object.keys(demoData.snapshots[accountId]).forEach(key => {
            const [, year] = key.split('-');
            if (parseInt(year) === selectedYear) {
              yearFilteredSnapshots[accountId][key] = demoData.snapshots[accountId][key];
            }
          });
        });
      }

      // Only update state if accounts have actually changed
      const newAccounts = demoData.accounts || { assets: [], liabilities: [] };

      setDemoState(prevState => {
        // If accounts are the same reference, don't update to prevent re-renders
        if (prevState.accounts === newAccounts) {
          return {
            ...prevState,
            loading: false,
            error: null,
            yearData: demoData.yearData,
            goals: demoData.goals || [],
            snapshots: yearFilteredSnapshots,
            snapshotsCurrency: yearFilteredSnapshots
          };
        }

        return {
          loading: false,
          error: null,
          yearData: demoData.yearData,
          accounts: newAccounts,
          goals: demoData.goals || [],
          snapshots: yearFilteredSnapshots,
          snapshotsCurrency: yearFilteredSnapshots
        };
      });
    }
  }, [isDemo, demoData, selectedYear]);

  // Demo data manipulation functions
  const demoAddAccount = useCallback(async (name, type) => {
    if (!isDemo || !demoData) return null;

    const newAccount = {
      id: `demo_${Date.now()}`,
      name,
      type,
      snapshots: [],
      created_at: new Date().toISOString()
    };

    const updatedAccounts = { ...demoData.accounts };
    if (type === 'asset') {
      updatedAccounts.assets = [...(updatedAccounts.assets || []), newAccount];
    } else {
      updatedAccounts.liabilities = [...(updatedAccounts.liabilities || []), newAccount];
    }

    const updatedData = { ...demoData, accounts: updatedAccounts };
    const result = await updateDemoData(updatedData);

    return result.success ? newAccount : null;
  }, [isDemo, demoData, updateDemoData]);

  const demoUpdateAccount = useCallback(async (accountId, updates) => {
    if (!isDemo || !demoData) return { success: false };
    
    const updatedAccounts = { ...demoData.accounts };
    
    // Update in assets
    const assetIndex = updatedAccounts.assets.findIndex(a => a.id === accountId);
    if (assetIndex > -1) {
      updatedAccounts.assets[assetIndex] = {
        ...updatedAccounts.assets[assetIndex],
        ...updates
      };
    }
    
    // Update in liabilities
    const liabilityIndex = updatedAccounts.liabilities.findIndex(l => l.id === accountId);
    if (liabilityIndex > -1) {
      updatedAccounts.liabilities[liabilityIndex] = {
        ...updatedAccounts.liabilities[liabilityIndex],
        ...updates
      };
    }
    
    const updatedData = { ...demoData, accounts: updatedAccounts };
    await updateDemoData(updatedData);
    
    return { success: true };
  }, [isDemo, demoData, updateDemoData]);

  const demoDeleteAccount = useCallback(async (accountId, type) => {
    if (!isDemo || !demoData) return { success: false };
    
    const updatedAccounts = { ...demoData.accounts };
    
    if (type === 'asset' || type === 'assets') {
      updatedAccounts.assets = updatedAccounts.assets.filter(a => a.id !== accountId);
    } else {
      updatedAccounts.liabilities = updatedAccounts.liabilities.filter(l => l.id !== accountId);
    }
    
    // Remove snapshots for this account
    const updatedSnapshots = { ...demoData.snapshots };
    delete updatedSnapshots[accountId];
    
    const updatedData = { 
      ...demoData, 
      accounts: updatedAccounts,
      snapshots: updatedSnapshots
    };
    await updateDemoData(updatedData);
    
    return { success: true };
  }, [isDemo, demoData, updateDemoData]);

  const demoUpdateSnapshot = useCallback(async (accountId, month, value, inputCurrency = null) => {
    if (!isDemo || !demoData) return { success: false };

    const numValue = parseFloat(value) || 0;
    const updatedSnapshots = { ...demoData.snapshots };
    const key = `${month}-${selectedYear}`;

    if (!updatedSnapshots[accountId]) {
      updatedSnapshots[accountId] = {};
    }

    updatedSnapshots[accountId][key] = {
      value: numValue,
      original_value: numValue,
      original_currency: inputCurrency || 'USD',
      month: month,
      year: selectedYear
    };

    const updatedData = { ...demoData, snapshots: updatedSnapshots };
    const result = await updateDemoData(updatedData);

    return { success: result.success };
  }, [isDemo, demoData, updateDemoData, selectedYear]);

  const demoDeleteSnapshot = useCallback(async (accountId, month) => {
    if (!isDemo || !demoData) return { success: false };

    const updatedSnapshots = { ...demoData.snapshots };
    const key = `${month}-${selectedYear}`;

    if (updatedSnapshots[accountId]) {
      const accountSnapshots = { ...updatedSnapshots[accountId] };
      delete accountSnapshots[key];
      if (Object.keys(accountSnapshots).length === 0) {
        delete updatedSnapshots[accountId];
      } else {
        updatedSnapshots[accountId] = accountSnapshots;
      }
    }

    const updatedData = { ...demoData, snapshots: updatedSnapshots };
    const result = await updateDemoData(updatedData);

    return { success: result.success };
  }, [isDemo, demoData, updateDemoData, selectedYear]);

  const demoAddGoal = useCallback(async (name, targetAmount) => {
    if (!isDemo || !demoData) return null;

    const numTarget = parseFloat(targetAmount);

    const newGoal = {
      id: `demo_goal_${Date.now()}`,
      name,
      target_amount: numTarget,
      current_amount: 0,
      completed: false,
      original_target_amount: numTarget,
      original_current_amount: 0,
      original_currency: 'USD',
      created_at: new Date().toISOString()
    };

    const updatedGoals = [...(demoData.goals || []), newGoal];
    const updatedData = { ...demoData, goals: updatedGoals };
    const result = await updateDemoData(updatedData);

    return result.success ? newGoal : null;
  }, [isDemo, demoData, updateDemoData]);

  const demoUpdateGoal = useCallback(async (goalId, updates) => {
    if (!isDemo || !demoData) return { success: false };

    const updatedGoals = (demoData.goals || []).map(goal =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    );

    const updatedData = { ...demoData, goals: updatedGoals };
    const result = await updateDemoData(updatedData);

    return { success: result.success };
  }, [isDemo, demoData, updateDemoData]);

  const demoUpdateGoalProgress = useCallback(async (goalId, currentAmount) => {
    const numAmount = parseFloat(currentAmount) || 0;
    return demoUpdateGoal(goalId, {
      current_amount: numAmount,
      original_current_amount: numAmount
    });
  }, [demoUpdateGoal]);

  const demoDeleteGoal = useCallback(async (goalId) => {
    if (!isDemo || !demoData) return { success: false };

    const updatedGoals = (demoData.goals || []).filter(goal => goal.id !== goalId);
    const updatedData = { ...demoData, goals: updatedGoals };
    await updateDemoData(updatedData);

    return { success: true };
  }, [isDemo, demoData, updateDemoData]);

  const demoUpdateAccountMetadata = useCallback(async (accountId, metadata) => {
    if (!isDemo || !demoData) return { success: false };

    return demoUpdateAccount(accountId, { metadata });
  }, [isDemo, demoData, demoUpdateAccount]);

  const demoUpdateAnnualGoal = useCallback(async (annualGoal) => {
    if (!isDemo || !demoData) return { success: false };
    
    const updatedYearData = {
      ...demoData.yearData,
      annual_goal: annualGoal
    };
    
    const updatedData = { ...demoData, yearData: updatedYearData };
    await updateDemoData(updatedData);
    
    return { success: true };
  }, [isDemo, demoData, updateDemoData]);

  const demoGetSnapshotValue = useCallback((accountId, month, year = null) => {
    if (!demoData || !demoData.snapshots) return 0;
    const targetYear = year || selectedYear;
    const key = `${month}-${targetYear}`;
    return demoData.snapshots[accountId]?.[key]?.value || 0;
  }, [demoData, selectedYear]);

  const demoGetSnapshotCurrencyData = useCallback((accountId, month, year = null) => {
    if (!demoData || !demoData.snapshots) return null;
    const targetYear = year || selectedYear;
    const key = `${month}-${targetYear}`;
    return demoData.snapshots[accountId]?.[key] || null;
  }, [demoData, selectedYear]);

  // Return appropriate data and functions based on mode
  if (isDemo) {
    return {
      loading: demoLoading || demoState.loading,
      error: demoState.error,
      yearData: demoState.yearData,
      accounts: demoState.accounts,
      goals: demoState.goals,
      snapshots: demoState.snapshots,
      snapshotsCurrency: demoState.snapshotsCurrency,
      
      // Demo functions
      addAccount: demoAddAccount,
      updateAccount: demoUpdateAccount,
      deleteAccount: demoDeleteAccount,
      updateAccountMetadata: demoUpdateAccountMetadata,
      updateSnapshot: demoUpdateSnapshot,
      deleteSnapshot: demoDeleteSnapshot,
      addGoal: demoAddGoal,
      updateGoal: demoUpdateGoal,
      updateGoalProgress: demoUpdateGoalProgress,
      deleteGoal: demoDeleteGoal,
      updateAnnualGoal: demoUpdateAnnualGoal,
      getSnapshotValue: demoGetSnapshotValue,
      getSnapshotCurrencyData: demoGetSnapshotCurrencyData,
      
      // Demo multi-year data generation
      fetchSnapshots: async () => ({ success: true }),
      fetchMultiYearSnapshots: async (accountIds, years) => {
        if (!demoData || !accountIds || !years) {
          return {};
        }

        // Add a simple debounce mechanism
        const cacheKey = `${accountIds.join(',')}_${years.join(',')}`;
        if (demoFetchCache.current[cacheKey]) {
          return demoFetchCache.current[cacheKey];
        }

        const multiYearData = {};
        const currentYear = new Date().getFullYear();

        // Safety check to prevent excessive computation
        if (accountIds.length > 50 || years.length > 10) {
          console.warn('Demo: Too many accounts or years requested, limiting generation');
          return {};
        }

        years.forEach(year => {
          if (year <= currentYear && year >= currentYear - 4) {
            multiYearData[year] = {
              snapshots: {},
              snapshotsCurrency: {}
            };

            // Use actual demo snapshot data instead of generating new data
            accountIds.forEach(accountId => {
              for (let month = 0; month < 12; month++) {
                const key = `${accountId}_${month}`;
                const snapshotKey = `${month}-${year}`;

                // Get the real snapshot data from demoData.snapshots
                const snapshotData = demoData.snapshots?.[accountId]?.[snapshotKey];

                if (snapshotData && snapshotData.value !== undefined) {
                  multiYearData[year].snapshots[key] = snapshotData.value;
                  multiYearData[year].snapshotsCurrency[key] = {
                    originalValue: snapshotData.original_value || snapshotData.value,
                    originalCurrency: snapshotData.original_currency || 'USD',
                    displayValue: snapshotData.value,
                    displayCurrency: 'USD',
                    entryDate: new Date(year, month, 15).toISOString()
                  };
                }
              }
            });
          }
        });

        // Cache the result to prevent regeneration
        demoFetchCache.current[cacheKey] = multiYearData;
        return multiYearData;
      },
      updateAccountOrder: async () => ({ success: true }),
      toggleAccountActive: async () => ({ success: true }),
      loadData: async () => ({ success: true }),
      reload: async () => ({ success: true }),
      
      // Demo indicator
      isDemo: true
    };
  }
  
  // Return real data hook for authenticated users
  return {
    ...realDataHook,
    isDemo: false
  };
};
