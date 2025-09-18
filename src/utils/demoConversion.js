import { supabase } from '../lib/supabase';
import { loadDemoData, cleanupDemoSession, getDemoSessionId } from './demoSession';

/**
 * Convert demo session data to a real user account
 */
export const convertDemoToRealAccount = async (userId) => {
  try {
    // Load demo data
    const demoData = await loadDemoData('financial_data');
    if (!demoData) {
      return { success: false, error: 'No demo data found' };
    }

    // Create financial year for the user
    const { data: yearData, error: yearError } = await supabase
      .from('financial_years')
      .upsert({
        user_id: userId,
        year: demoData.yearData.year,
        annual_goal: demoData.yearData.annual_goal || ''
      }, {
        onConflict: 'user_id,year',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (yearError) {
      console.error('Error creating year:', yearError);
      return { success: false, error: yearError.message };
    }

    // Convert demo accounts to real accounts
    const accountMapping = {}; // Map old IDs to new IDs
    
    // Process assets
    for (const asset of demoData.accounts.assets || []) {
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          year_id: yearData.id,
          name: asset.name,
          type: 'asset',
          icon: asset.icon || '💰',
          sort_order: asset.sort_order || 0,
          is_active: asset.is_active !== false
        })
        .select()
        .single();

      if (accountError) {
        console.error('Error creating asset:', accountError);
        continue;
      }

      accountMapping[asset.id] = newAccount.id;

      // Create snapshots for this account
      if (asset.snapshots && Array.isArray(asset.snapshots)) {
        const snapshots = asset.snapshots.map(snapshot => ({
          account_id: newAccount.id,
          month: snapshot.month,
          year: snapshot.year,
          value: snapshot.value,
          original_value: snapshot.original_value || snapshot.value,
          original_currency: snapshot.original_currency || 'USD'
        }));

        if (snapshots.length > 0) {
          const { error: snapshotError } = await supabase
            .from('account_snapshots')
            .insert(snapshots);

          if (snapshotError) {
            console.error('Error creating snapshots:', snapshotError);
          }
        }
      } else if (demoData.snapshots && demoData.snapshots[asset.id]) {
        // Handle snapshots stored separately
        const snapshotData = demoData.snapshots[asset.id];
        const snapshots = [];
        
        for (const [key, value] of Object.entries(snapshotData)) {
          const [month, year] = key.split('-').map(Number);
          snapshots.push({
            account_id: newAccount.id,
            month,
            year,
            value: value.value || value,
            original_value: value.original_value || value.value || value,
            original_currency: value.original_currency || 'USD'
          });
        }

        if (snapshots.length > 0) {
          const { error: snapshotError } = await supabase
            .from('account_snapshots')
            .insert(snapshots);

          if (snapshotError) {
            console.error('Error creating snapshots:', snapshotError);
          }
        }
      }
    }

    // Process liabilities
    for (const liability of demoData.accounts.liabilities || []) {
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          year_id: yearData.id,
          name: liability.name,
          type: 'liability',
          icon: liability.icon || '💳',
          sort_order: liability.sort_order || 0,
          is_active: liability.is_active !== false
        })
        .select()
        .single();

      if (accountError) {
        console.error('Error creating liability:', accountError);
        continue;
      }

      accountMapping[liability.id] = newAccount.id;

      // Create snapshots for this account
      if (liability.snapshots && Array.isArray(liability.snapshots)) {
        const snapshots = liability.snapshots.map(snapshot => ({
          account_id: newAccount.id,
          month: snapshot.month,
          year: snapshot.year,
          value: snapshot.value,
          original_value: snapshot.original_value || snapshot.value,
          original_currency: snapshot.original_currency || 'USD'
        }));

        if (snapshots.length > 0) {
          const { error: snapshotError } = await supabase
            .from('account_snapshots')
            .insert(snapshots);

          if (snapshotError) {
            console.error('Error creating snapshots:', snapshotError);
          }
        }
      } else if (demoData.snapshots && demoData.snapshots[liability.id]) {
        // Handle snapshots stored separately
        const snapshotData = demoData.snapshots[liability.id];
        const snapshots = [];
        
        for (const [key, value] of Object.entries(snapshotData)) {
          const [month, year] = key.split('-').map(Number);
          snapshots.push({
            account_id: newAccount.id,
            month,
            year,
            value: value.value || value,
            original_value: value.original_value || value.value || value,
            original_currency: value.original_currency || 'USD'
          });
        }

        if (snapshots.length > 0) {
          const { error: snapshotError } = await supabase
            .from('account_snapshots')
            .insert(snapshots);

          if (snapshotError) {
            console.error('Error creating snapshots:', snapshotError);
          }
        }
      }
    }

    // Convert goals
    if (demoData.goals && demoData.goals.length > 0) {
      const goals = demoData.goals.map(goal => ({
        user_id: userId,
        year_id: yearData.id,
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        completed: goal.completed || false,
        original_target_amount: goal.original_target_amount || goal.target_amount,
        original_current_amount: goal.original_current_amount || goal.current_amount || 0,
        original_currency: goal.original_currency || 'USD'
      }));

      const { error: goalsError } = await supabase
        .from('goals')
        .insert(goals);

      if (goalsError) {
        console.error('Error creating goals:', goalsError);
      }
    }

    // Clean up demo session
    const sessionId = getDemoSessionId();
    if (sessionId) {
      await cleanupDemoSession(sessionId);
    }

    return { 
      success: true, 
      message: 'Demo data successfully converted to your account',
      yearId: yearData.id
    };
  } catch (error) {
    console.error('Error converting demo to real account:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user is coming from demo with convert flag
 */
export const shouldConvertDemo = () => {
  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const convertParam = urlParams.get('convert');
  
  // Check if there's an active demo session
  const sessionId = getDemoSessionId();
  
  return convertParam === 'true' && sessionId;
};