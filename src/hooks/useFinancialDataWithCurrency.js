import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  convertValue,
  saveLastKnownCurrency
} from '../utils/currencyConversion';
import { getAccountCanonicalKey, getAccountLegacyKey } from '../utils/accountUtils';

export const useFinancialDataWithCurrency = (selectedYear) => {
  const { user } = useAuth();
  const { currency: displayCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearData, setYearData] = useState(null);
  const [accounts, setAccounts] = useState({ assets: [], liabilities: [] });
  const [goals, setGoals] = useState([]);
  const [snapshots, setSnapshots] = useState({});
  const [snapshotsCurrency, setSnapshotsCurrency] = useState({});
  const [conversionPending, setConversionPending] = useState(false);
  const loadingRef = useRef(false);

  // Save current currency as last known for migration purposes
  useEffect(() => {
    if (displayCurrency) {
      saveLastKnownCurrency(displayCurrency);
    }
  }, [displayCurrency]);

  // Fetch or create financial year with proper duplicate handling
  const fetchOrCreateYear = useCallback(async () => {
    if (!user) return null;

    try {
      let { data: existingYear, error: fetchError } = await supabase
        .from('financial_years')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', selectedYear)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If year doesn't exist, create it with upsert to handle race conditions
      if (!existingYear) {
        const { data: newYear, error: createError } = await supabase
          .from('financial_years')
          .upsert(
            {
              user_id: user.id,
              year: selectedYear,
              annual_goal: ''
            },
            { 
              onConflict: 'user_id,year',
              ignoreDuplicates: true 
            }
          )
          .select()
          .single();

        if (createError) {
          // If upsert failed due to race condition, try to fetch again
          if (createError.code === '23505' || createError.message?.includes('duplicate')) {
            const { data: retryYear, error: retryError } = await supabase
              .from('financial_years')
              .select('*')
              .eq('user_id', user.id)
              .eq('year', selectedYear)
              .single();
            
            if (retryError) throw retryError;
            existingYear = retryYear;
          } else {
            throw createError;
          }
        } else {
          existingYear = newYear;
        }
      }

      return existingYear;
    } catch (err) {
      console.error('Error fetching/creating year:', err);
      setError(err.message);
      return null;
    }
  }, [user, selectedYear]);

  // Fetch accounts and return the data
  const fetchAccountsAndReturn = useCallback(async (yearId) => {
    if (!yearId) return [];

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('year_id', yearId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const assets = data.filter(a => a.type === 'asset');
      const liabilities = data.filter(a => a.type === 'liability');
      
      setAccounts({ assets, liabilities });
      
      return data || [];
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Fetch goals with currency support
  const fetchGoals = useCallback(async (yearId) => {
    if (!yearId) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('year_id', yearId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Convert goals to display currency
      const convertedGoals = await Promise.all((data || []).map(async (goal) => {
        // Handle legacy data without original values
        const originalTarget = goal.original_target_amount ?? goal.target_amount;
        const originalCurrent = goal.original_current_amount ?? goal.current_amount;
        const originalCurrency = goal.original_currency || displayCurrency;

        const targetAmount = await convertValue(originalTarget, originalCurrency, displayCurrency);
        const currentAmount = await convertValue(originalCurrent, originalCurrency, displayCurrency);

        return {
          ...goal,
          target_amount: targetAmount,
          current_amount: currentAmount,
          display_currency: displayCurrency,
          original_currency: originalCurrency
        };
      }));

      setGoals(convertedGoals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.message);
    }
  }, [displayCurrency]);

  // Fetch and convert account snapshots
  const fetchSnapshots = useCallback(async (accountIds) => {
    if (!accountIds || accountIds.length === 0) {
      console.log('No account IDs provided for snapshot fetch');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('account_snapshots')
        .select('*')
        .in('account_id', accountIds)
        .eq('year', selectedYear);

      if (error) throw error;

      // Process snapshots with currency conversion
      const snapshotMap = {};
      const currencyMap = {};

      await Promise.all((data || []).map(async (snapshot) => {
        const key = `${snapshot.account_id}_${snapshot.month}`;
        
        // Handle legacy data
        const originalValue = snapshot.original_value ?? snapshot.value;
        const originalCurrency = snapshot.original_currency || displayCurrency;
        
        // Convert to display currency
        const displayValue = await convertValue(originalValue, originalCurrency, displayCurrency);
        
        snapshotMap[key] = displayValue;
        currencyMap[key] = {
          originalValue,
          originalCurrency,
          displayValue,
          displayCurrency,
          entryDate: snapshot.entry_date || snapshot.created_at
        };
      }));
      
      setSnapshots(snapshotMap);
      setSnapshotsCurrency(currencyMap);
    } catch (err) {
      console.error('Error fetching snapshots:', err);
      setError(err.message);
    }
  }, [selectedYear, displayCurrency]);

  // Fetch snapshots for multiple years (for YoY functionality)
  const fetchMultiYearSnapshots = useCallback(async (accountIds, years) => {
    if (!user || !years || years.length === 0) {
      return {};
    }

    try {
      // For YoY chart: Get ALL user accounts across ALL years to capture historical data
      // This allows accounts created in different years to show in YoY view
      const { data: allUserAccounts, error: accountError } = await supabase
        .from('accounts')
        .select('id, name, type')
        .eq('user_id', user.id);

      if (accountError) throw accountError;

      // Use all historical account IDs, not just current year accounts
      const allAccountIds = allUserAccounts?.map(acc => acc.id) || [];

      if (allAccountIds.length === 0) {
        return {};
      }

      const { data: snapshots, error } = await supabase
        .from('account_snapshots')
        .select('*')
        .in('account_id', allAccountIds)
        .in('year', years);

      if (error) throw error;

      console.log('🔍 REAL USER fetchMultiYearSnapshots DEBUG:');
      console.log('📊 Raw snapshots from DB:', snapshots?.length || 0);
      console.log('📅 Requested years:', years);
      console.log('🏦 All historical account IDs:', allAccountIds.length);
      console.log('🏦 Original current year account IDs:', accountIds?.length || 0);
      if (snapshots?.length > 0) {
        console.log('📋 Sample snapshot:', snapshots[0]);
        const yearBreakdown = {};
        snapshots.forEach(s => {
          yearBreakdown[s.year] = (yearBreakdown[s.year] || 0) + 1;
        });
        console.log('📈 Snapshots by year:', yearBreakdown);
      }

      // Process snapshots with currency conversion and organize by year
      const multiYearData = {};

      await Promise.all((snapshots || []).map(async (snapshot) => {
        const year = snapshot.year;
        const key = `${snapshot.account_id}_${snapshot.month}`;

        if (!multiYearData[year]) {
          multiYearData[year] = {
            snapshots: {},
            snapshotsCurrency: {}
          };
        }

        // Handle legacy data
        const originalValue = snapshot.original_value ?? snapshot.value;
        const originalCurrency = snapshot.original_currency || displayCurrency;

        // Convert to display currency
        const displayValue = await convertValue(originalValue, originalCurrency, displayCurrency);

        multiYearData[year].snapshots[key] = displayValue;
        multiYearData[year].snapshotsCurrency[key] = {
          originalValue,
          originalCurrency,
          displayValue,
          displayCurrency,
          entryDate: snapshot.entry_date || snapshot.created_at
        };
      }));

      console.log('✅ FINAL multiYearData result:');
      Object.keys(multiYearData).forEach(year => {
        const yearData = multiYearData[year];
        console.log(`📅 Year ${year}: ${Object.keys(yearData.snapshots).length} snapshots`);
        if (Object.keys(yearData.snapshots).length > 0) {
          console.log(`   Sample keys:`, Object.keys(yearData.snapshots).slice(0, 3));
          console.log(`   Sample values:`, Object.keys(yearData.snapshots).slice(0, 3).map(key => yearData.snapshots[key]));
        }
      });

      // Add account type mapping for YoY chart processing
      const accountTypeMap = {};
      (allUserAccounts || []).forEach(account => {
        accountTypeMap[account.id] = account.type;
      });

      return {
        ...multiYearData,
        accountTypeMap
      };
    } catch (err) {
      console.error('Error fetching multi-year snapshots:', err);
      return {};
    }
  }, [user, displayCurrency]);

  // Copy accounts from previous year to current year (structure only, not values)
  const copyAccountsFromPreviousYear = useCallback(async (currentYearId) => {
    if (!user) return [];

    try {
      // Get previous year's financial_year record
      const { data: prevYearData, error: prevYearError } = await supabase
        .from('financial_years')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', selectedYear - 1)
        .single();

      if (prevYearError || !prevYearData) {
        console.log('No previous year data found to copy accounts from');
        return [];
      }

      // Fetch accounts from previous year
      const { data: prevAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('year_id', prevYearData.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (accountsError) throw accountsError;
      if (!prevAccounts || prevAccounts.length === 0) {
        return [];
      }

      const { data: existingAccounts, error: existingError } = await supabase
        .from('accounts')
        .select('id, name, type, canonical_id')
        .eq('year_id', currentYearId)
        .eq('is_active', true);

      if (existingError) throw existingError;

      const existingCanonicalIds = new Set(
        (existingAccounts || [])
          .map((acc) => getAccountCanonicalKey(acc) || acc.id)
          .filter(Boolean)
      );
      const existingLegacyKeys = new Set(
        (existingAccounts || [])
          .map((acc) => getAccountLegacyKey(acc))
          .filter(Boolean)
      );

      // Create copies of accounts in current year (without snapshot values)
      const newAccounts = [];
      for (const account of prevAccounts) {
        const canonicalId = getAccountCanonicalKey(account) || account.id;
        const legacyKey = getAccountLegacyKey(account);

        if (
          (canonicalId && existingCanonicalIds.has(canonicalId)) ||
          (legacyKey && existingLegacyKeys.has(legacyKey))
        ) {
          continue;
        }

        const { data: newAccount, error: insertError } = await supabase
          .from('accounts')
          .insert([
            {
              user_id: user.id,
              year_id: currentYearId,
              name: account.name,
              type: account.type,
              sort_order: account.sort_order,
              is_active: true,
              canonical_id: canonicalId
            }
          ])
          .select()
          .single();

        if (!insertError && newAccount) {
          newAccounts.push(newAccount);
          if (canonicalId) {
            existingCanonicalIds.add(canonicalId);
          }
          if (legacyKey) {
            existingLegacyKeys.add(legacyKey);
          }
        }
      }

      console.log(`Copied ${newAccounts.length} accounts from ${selectedYear - 1} to ${selectedYear}`);
      return newAccounts;
    } catch (err) {
      console.error('Error copying accounts from previous year:', err);
      return [];
    }
  }, [user, selectedYear]);

  // Load all data with debounce to prevent duplicate calls
  const loadData = useCallback(async () => {
    // Prevent duplicate simultaneous loads
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const year = await fetchOrCreateYear();
      if (year) {
        setYearData(year);

        let accountsData = await fetchAccountsAndReturn(year.id);

        // If no accounts exist in current year, try to copy from previous year
        if (!accountsData || accountsData.length === 0) {
          console.log('No accounts in current year, attempting to copy from previous year...');
          accountsData = await copyAccountsFromPreviousYear(year.id);

          if (accountsData && accountsData.length > 0) {
            // Update local state with the newly created accounts
            const assets = accountsData.filter(a => a.type === 'asset');
            const liabilities = accountsData.filter(a => a.type === 'liability');
            setAccounts({ assets, liabilities });
          }
        }

        await fetchGoals(year.id);

        if (accountsData && accountsData.length > 0) {
          await fetchSnapshots(accountsData.map(a => a.id));
        } else {
          setSnapshots({});
          setSnapshotsCurrency({});
        }
      }
    } catch (err) {
      console.error('Error in loadData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      // Add small delay before allowing next load
      setTimeout(() => {
        loadingRef.current = false;
      }, 100);
    }
  }, [fetchOrCreateYear, fetchAccountsAndReturn, fetchGoals, fetchSnapshots, copyAccountsFromPreviousYear]);

  // Convert all values when currency changes
  useEffect(() => {
    const convertAllValues = async () => {
      if (!displayCurrency || Object.keys(snapshots).length === 0) return;
      
      setConversionPending(true);
      
      try {
        // Re-fetch data with new currency
        const accountIds = [...accounts.assets, ...accounts.liabilities].map(a => a.id);
        if (accountIds.length > 0) {
          await fetchSnapshots(accountIds);
        }
        
        if (yearData) {
          await fetchGoals(yearData.id);
        }
      } catch (err) {
        console.error('Error converting values:', err);
      } finally {
        setConversionPending(false);
      }
    };

    convertAllValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayCurrency]); // Only re-run when display currency changes

  // Add account
  const addAccount = async (name, type) => {
    if (!yearData) return null;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: user.id,
            year_id: yearData.id,
            name,
            type,
            sort_order: type === 'asset' ? accounts.assets.length : accounts.liabilities.length
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (type === 'asset') {
        setAccounts(prev => ({ ...prev, assets: [...prev.assets, data] }));
      } else {
        setAccounts(prev => ({ ...prev, liabilities: [...prev.liabilities, data] }));
      }

      return data;
    } catch (err) {
      console.error('Error adding account:', err);
      setError(err.message);
      return null;
    }
  };

  // Delete account
  const deleteAccount = async (accountId, type) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      if (type === 'asset' || type === 'assets') {
        setAccounts(prev => ({ 
          ...prev, 
          assets: prev.assets.filter(a => a.id !== accountId) 
        }));
      } else {
        setAccounts(prev => ({ 
          ...prev, 
          liabilities: prev.liabilities.filter(a => a.id !== accountId) 
        }));
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message);
    }
  };

  // Update snapshot value with currency support
  const updateSnapshot = async (accountId, month, value, inputCurrency = null) => {
    try {
      const numValue = parseFloat(value) || 0;
      const currency = inputCurrency || displayCurrency;

      console.log(`[updateSnapshot] accountId=${accountId.slice(0,8)}..., month=${month}, year=${selectedYear}, value=${value}, numValue=${numValue}`);

      // Check if snapshot exists
      const { data: existing } = await supabase
        .from('account_snapshots')
        .select('id, value')
        .eq('account_id', accountId)
        .eq('month', month)
        .eq('year', selectedYear)
        .single();

      console.log(`[updateSnapshot] existing snapshot:`, existing ? `id=${existing.id.slice(0,8)}..., oldValue=${existing.value}` : 'none');

      const snapshotData = {
        value: numValue, // Keep display value for backward compatibility
        original_value: numValue,
        original_currency: currency,
        entry_date: new Date().toISOString()
      };

      let result;
      if (existing) {
        console.log(`[updateSnapshot] UPDATING existing snapshot to ${numValue}`);
        result = await supabase
          .from('account_snapshots')
          .update(snapshotData)
          .eq('id', existing.id);
      } else {
        console.log(`[updateSnapshot] INSERTING new snapshot with ${numValue}`);
        result = await supabase
          .from('account_snapshots')
          .insert([
            {
              account_id: accountId,
              month,
              year: selectedYear,
              ...snapshotData
            }
          ]);
      }

      if (result.error) {
        console.error(`[updateSnapshot] ERROR:`, result.error);
        throw result.error;
      }

      console.log(`[updateSnapshot] SUCCESS, rows affected: ${result.data?.length || result.count || 'unknown'}`);

      // Update local state with converted value
      const key = `${accountId}_${month}`;
      const displayValue = await convertValue(numValue, currency, displayCurrency);

      setSnapshots(prev => ({ ...prev, [key]: displayValue }));
      setSnapshotsCurrency(prev => ({
        ...prev,
        [key]: {
          originalValue: numValue,
          originalCurrency: currency,
          displayValue,
          displayCurrency,
          entryDate: new Date().toISOString()
        }
      }));
    } catch (err) {
      console.error('[updateSnapshot] Exception:', err);
      setError(err.message);
    }
  };

  const deleteSnapshot = async (accountId, month) => {
    try {
      const { error } = await supabase
        .from('account_snapshots')
        .delete()
        .eq('account_id', accountId)
        .eq('month', month)
        .eq('year', selectedYear);

      if (error) throw error;

      const key = `${accountId}_${month}`;
      setSnapshots(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSnapshotsCurrency(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err) {
      console.error('Error deleting snapshot:', err);
      setError(err.message);
    }
  };

  // Add goal with currency support
  const addGoal = async (name, targetAmount) => {
    if (!yearData) return null;

    try {
      const numTarget = parseFloat(targetAmount);
      
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            year_id: yearData.id,
            name,
            target_amount: numTarget,
            current_amount: 0,
            original_target_amount: numTarget,
            original_current_amount: 0,
            original_currency: displayCurrency,
            target_currency: displayCurrency,
            entry_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding goal:', err);
      setError(err.message);
      return null;
    }
  };

  // Update goal progress with currency support
  const updateGoalProgress = async (goalId, currentAmount) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const numCurrent = parseFloat(currentAmount) || 0;
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: numCurrent,
          original_current_amount: numCurrent,
          original_currency: displayCurrency,
          completed: numCurrent >= goal.target_amount
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, current_amount: numCurrent, original_current_amount: numCurrent }
          : g
      ));
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err.message);
    }
  };

  // Delete goal
  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err.message);
    }
  };

  // Get snapshot value (already converted to display currency)
  const getSnapshotValue = (accountId, month) => {
    const key = `${accountId}_${month}`;
    return snapshots[key] || 0;
  };

  // Get currency data for a snapshot
  const getSnapshotCurrencyData = (accountId, month) => {
    const key = `${accountId}_${month}`;
    return snapshotsCurrency[key] || null;
  };

  useEffect(() => {
    if (user && selectedYear) {
      loadData();
    }
  }, [user, selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading: loading || conversionPending,
    error,
    yearData,
    accounts,
    goals,
    snapshots,
    snapshotsCurrency,
    displayCurrency,
    addAccount,
    deleteAccount,
    updateSnapshot,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    getSnapshotValue,
    getSnapshotCurrencyData,
    deleteSnapshot,
    fetchMultiYearSnapshots,
    reload: loadData
  };
};
