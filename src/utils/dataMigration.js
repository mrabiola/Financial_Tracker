/**
 * Data Migration Utilities for Multi-Year Support
 * Handles conversion from single-year to multi-year data structure
 */

import { supabase } from '../lib/supabase';

/**
 * Check if user needs multi-year data migration
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if migration is needed
 */
export const needsMultiYearMigration = async (userId) => {
  try {
    // Check if user has financial_years records for multiple years
    const { data: years, error } = await supabase
      .from('financial_years')
      .select('year')
      .eq('user_id', userId);

    if (error) throw error;

    // If user has only one year or no years, check if they have legacy data
    if (!years || years.length <= 1) {
      // Check for account_snapshots without proper year association
      const { data: snapshots, error: snapshotError } = await supabase
        .from('account_snapshots')
        .select('year, account_id')
        .in('account_id', function(subquery) {
          return subquery
            .from('accounts')
            .select('id')
            .eq('user_id', userId);
        })
        .limit(1);

      if (snapshotError) throw snapshotError;

      // If we have snapshots but limited years, migration may be needed
      return snapshots && snapshots.length > 0 && years && years.length <= 1;
    }

    return false;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

/**
 * Migrate user data to support multi-year structure
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const migrateToMultiYear = async (userId) => {
  try {
    const currentYear = new Date().getFullYear();

    // Step 1: Ensure financial_years records exist for recent years
    const yearsToCreate = [];
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      yearsToCreate.push({
        user_id: userId,
        year: year,
        annual_goal: ''
      });
    }

    // Use upsert to avoid conflicts
    const { error: yearError } = await supabase
      .from('financial_years')
      .upsert(yearsToCreate, {
        onConflict: 'user_id,year',
        ignoreDuplicates: true
      });

    if (yearError && !yearError.message?.includes('duplicate')) {
      throw yearError;
    }

    // Step 2: Get all financial years for this user
    const { data: userYears, error: fetchError } = await supabase
      .from('financial_years')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    // Step 3: Ensure accounts are properly associated with years
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (accountError) throw accountError;

    // Step 4: For each account, ensure it exists in each year
    const accountsToCreate = [];
    userYears.forEach(yearRecord => {
      accounts.forEach(account => {
        // Check if account already exists for this year
        const existsForYear = account.year_id === yearRecord.id;
        if (!existsForYear && yearRecord.year === currentYear) {
          // Only create accounts for current year to avoid duplicates
          // Future years will be created as needed
          accountsToCreate.push({
            ...account,
            id: undefined, // Let database generate new ID
            year_id: yearRecord.id,
            created_at: new Date().toISOString()
          });
        }
      });
    });

    if (accountsToCreate.length > 0) {
      const { error: createAccountError } = await supabase
        .from('accounts')
        .insert(accountsToCreate);

      if (createAccountError) {
        console.warn('Some accounts may already exist:', createAccountError);
      }
    }

    // Step 5: Mark migration as complete
    const { error: flagError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        setting_key: 'multi_year_migration_complete',
        setting_value: 'true',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,setting_key'
      });

    if (flagError) {
      console.warn('Could not set migration flag:', flagError);
    }

    return {
      success: true,
      message: 'Multi-year migration completed successfully'
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`
    };
  }
};

/**
 * Check if migration has been completed for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if migration is complete
 */
export const isMigrationComplete = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('user_id', userId)
      .eq('setting_key', 'multi_year_migration_complete')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.setting_value === 'true';
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

/**
 * Create financial year record if it doesn't exist
 * @param {string} userId - User ID
 * @param {number} year - Year to create
 * @returns {Promise<object>} - Created year record
 */
export const ensureFinancialYear = async (userId, year) => {
  try {
    // Try to get existing year
    let { data: existingYear, error: fetchError } = await supabase
      .from('financial_years')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingYear) {
      return existingYear;
    }

    // Create new year
    const { data: newYear, error: createError } = await supabase
      .from('financial_years')
      .upsert({
        user_id: userId,
        year: year,
        annual_goal: ''
      }, {
        onConflict: 'user_id,year',
        ignoreDuplicates: true
      })
      .select()
      .single();

    if (createError) throw createError;

    return newYear;
  } catch (error) {
    console.error('Error ensuring financial year:', error);
    throw error;
  }
};