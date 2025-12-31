import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useFinancialData = (selectedYear) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearData, setYearData] = useState(null);
  const [accounts, setAccounts] = useState({ assets: [], liabilities: [] });
  const [goals, setGoals] = useState([]);
  const [snapshots, setSnapshots] = useState({});
  const loadingRef = useRef(false);

  // Fetch or create financial year with proper duplicate handling
  const fetchOrCreateYear = useCallback(async () => {
    if (!user) return null;

    try {
      // First try to get existing year
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


  // Fetch accounts and return the data (for loading snapshots)
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
      
      // Update state
      setAccounts({ assets, liabilities });
      
      // Return all accounts for snapshot fetching
      return data || [];
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Fetch goals for the year
  const fetchGoals = useCallback(async (yearId) => {
    if (!yearId) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('year_id', yearId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.message);
    }
  }, []);

  // Fetch account snapshots
  const fetchSnapshots = useCallback(async (accountIds) => {
    if (!accountIds || accountIds.length === 0) {
      console.log('No account IDs provided for snapshot fetch');
      return;
    }

    try {
      console.log('Fetching snapshots for account IDs:', accountIds, 'year:', selectedYear);
      
      const { data, error } = await supabase
        .from('account_snapshots')
        .select('*')
        .in('account_id', accountIds)
        .eq('year', selectedYear);

      if (error) throw error;

      console.log('Fetched', data?.length || 0, 'snapshots');

      // Convert snapshots to a map for easier access
      const snapshotMap = {};
      data?.forEach(snapshot => {
        const key = `${snapshot.account_id}_${snapshot.month}`;
        snapshotMap[key] = snapshot.value;
      });
      
      setSnapshots(snapshotMap);
    } catch (err) {
      console.error('Error fetching snapshots:', err);
      setError(err.message);
    }
  }, [selectedYear]);

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
        
        // Fetch accounts first and get the actual data
        const accountsData = await fetchAccountsAndReturn(year.id);
        await fetchGoals(year.id);

        // Now fetch snapshots using the actual accounts data
        if (accountsData && accountsData.length > 0) {
          console.log('Loading snapshots for', accountsData.length, 'accounts');
          await fetchSnapshots(accountsData.map(a => a.id));
        } else {
          console.log('No accounts found, skipping snapshot fetch');
          setSnapshots({}); // Clear any existing snapshots
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
  }, [fetchOrCreateYear, fetchAccountsAndReturn, fetchGoals, fetchSnapshots]);

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

      // Update local state
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

      // Update local state
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

  // Update snapshot value
  const updateSnapshot = async (accountId, month, value) => {
    try {
      const numValue = parseFloat(value) || 0;
      
      // Check if snapshot exists
      const { data: existing } = await supabase
        .from('account_snapshots')
        .select('id')
        .eq('account_id', accountId)
        .eq('month', month)
        .eq('year', selectedYear)
        .single();

      let result;
      if (existing) {
        // Update existing snapshot
        result = await supabase
          .from('account_snapshots')
          .update({ value: numValue })
          .eq('id', existing.id);
      } else {
        // Create new snapshot
        result = await supabase
          .from('account_snapshots')
          .insert([
            {
              account_id: accountId,
              month,
              year: selectedYear,
              value: numValue
            }
          ]);
      }

      if (result.error) throw result.error;

      // Update local state
      const key = `${accountId}_${month}`;
      setSnapshots(prev => ({ ...prev, [key]: numValue }));
    } catch (err) {
      console.error('Error updating snapshot:', err);
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
    } catch (err) {
      console.error('Error deleting snapshot:', err);
      setError(err.message);
    }
  };

  // Add goal
  const addGoal = async (name, targetAmount) => {
    if (!yearData) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            year_id: yearData.id,
            name,
            target_amount: parseFloat(targetAmount),
            current_amount: 0
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

  // Update goal progress
  const updateGoalProgress = async (goalId, currentAmount) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: parseFloat(currentAmount) || 0,
          completed: parseFloat(currentAmount) >= goals.find(g => g.id === goalId)?.target_amount
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, current_amount: parseFloat(currentAmount) || 0 }
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

  // Get snapshot value
  const getSnapshotValue = (accountId, month) => {
    const key = `${accountId}_${month}`;
    return snapshots[key] || 0;
  };

  useEffect(() => {
    if (user && selectedYear) {
      loadData();
    }
  }, [user, selectedYear, loadData]);

  return {
    loading,
    error,
    yearData,
    accounts,
    goals,
    snapshots,
    addAccount,
    deleteAccount,
    updateSnapshot,
    deleteSnapshot,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    getSnapshotValue,
    reload: loadData
  };
};
