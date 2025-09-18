import { useState, useEffect, useCallback } from 'react';
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

      setDemoState({
        loading: false,
        error: null,
        yearData: demoData.yearData,
        accounts: demoData.accounts || { assets: [], liabilities: [] },
        goals: demoData.goals || [],
        snapshots: yearFilteredSnapshots,
        snapshotsCurrency: yearFilteredSnapshots
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
      updateSnapshot: demoUpdateSnapshot,
      addGoal: demoAddGoal,
      updateGoal: demoUpdateGoal,
      updateGoalProgress: demoUpdateGoalProgress,
      deleteGoal: demoDeleteGoal,
      updateAnnualGoal: demoUpdateAnnualGoal,
      getSnapshotValue: demoGetSnapshotValue,
      getSnapshotCurrencyData: demoGetSnapshotCurrencyData,
      
      // Placeholder functions that demo doesn't support
      fetchSnapshots: async () => ({ success: true }),
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