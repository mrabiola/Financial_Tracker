import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';

const CurrencyMigration = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [migrationStatus, setMigrationStatus] = useState('checking');
  const [needsMigration, setNeedsMigration] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({
    snapshots: { total: 0, completed: 0 },
    goals: { total: 0, completed: 0 }
  });
  const [error, setError] = useState(null);

  // Check if migration is needed
  const checkMigrationNeeded = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check for snapshots without original_value
      const { data: unmigrated_snapshots, error: snapshotError } = await supabase
        .from('account_snapshots')
        .select('id')
        .is('original_value', null)
        .limit(1);

      if (snapshotError) throw snapshotError;

      // Check for goals without original values
      const { data: unmigrated_goals, error: goalError } = await supabase
        .from('goals')
        .select('id')
        .is('original_target_amount', null)
        .limit(1);

      if (goalError) throw goalError;

      const needsMigration = 
        (unmigrated_snapshots && unmigrated_snapshots.length > 0) ||
        (unmigrated_goals && unmigrated_goals.length > 0);

      setNeedsMigration(needsMigration);
      setMigrationStatus(needsMigration ? 'pending' : 'completed');
    } catch (err) {
      console.error('Error checking migration status:', err);
      setError(err.message);
      setMigrationStatus('error');
    }
  }, [user]);

  // Perform migration
  const performMigration = useCallback(async () => {
    if (!user) return;
    
    setMigrationStatus('running');
    setError(null);
    
    try {
      // Get the last known currency or use current currency
      const migrationCurrency = localStorage.getItem('lastKnownCurrency') || currency;
      
      // Migrate account snapshots
      const { data: snapshots, error: fetchSnapshotsError } = await supabase
        .from('account_snapshots')
        .select('*')
        .is('original_value', null);

      if (fetchSnapshotsError) throw fetchSnapshotsError;

      const snapshotTotal = snapshots?.length || 0;
      setMigrationProgress(prev => ({ ...prev, snapshots: { total: snapshotTotal, completed: 0 } }));

      // Update snapshots in batches
      if (snapshots && snapshots.length > 0) {
        for (let i = 0; i < snapshots.length; i++) {
          const snapshot = snapshots[i];
          const { error: updateError } = await supabase
            .from('account_snapshots')
            .update({
              original_value: snapshot.value,
              original_currency: migrationCurrency,
              entry_date: snapshot.created_at
            })
            .eq('id', snapshot.id);

          if (updateError) throw updateError;
          
          setMigrationProgress(prev => ({
            ...prev,
            snapshots: { ...prev.snapshots, completed: i + 1 }
          }));
        }
      }

      // Migrate goals
      const { data: goals, error: fetchGoalsError } = await supabase
        .from('goals')
        .select('*')
        .is('original_target_amount', null);

      if (fetchGoalsError) throw fetchGoalsError;

      const goalsTotal = goals?.length || 0;
      setMigrationProgress(prev => ({ ...prev, goals: { total: goalsTotal, completed: 0 } }));

      // Update goals
      if (goals && goals.length > 0) {
        for (let i = 0; i < goals.length; i++) {
          const goal = goals[i];
          const { error: updateError } = await supabase
            .from('goals')
            .update({
              original_target_amount: goal.target_amount,
              original_current_amount: goal.current_amount,
              original_currency: migrationCurrency,
              target_currency: migrationCurrency,
              entry_date: goal.created_at
            })
            .eq('id', goal.id);

          if (updateError) throw updateError;
          
          setMigrationProgress(prev => ({
            ...prev,
            goals: { ...prev.goals, completed: i + 1 }
          }));
        }
      }

      // Update user's preferred currency
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ preferred_currency: currency })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setMigrationStatus('completed');
      setNeedsMigration(false);
      
      // Mark migration as complete in localStorage
      localStorage.setItem('currencyMigrationCompleted', 'true');
      
    } catch (err) {
      console.error('Error during migration:', err);
      setError(err.message);
      setMigrationStatus('error');
    }
  }, [user, currency]);

  useEffect(() => {
    checkMigrationNeeded();
  }, [checkMigrationNeeded]);

  // Auto-run migration if needed and not already completed
  useEffect(() => {
    const migrationCompleted = localStorage.getItem('currencyMigrationCompleted');
    if (needsMigration && !migrationCompleted && migrationStatus === 'pending') {
      performMigration();
    }
  }, [needsMigration, migrationStatus, performMigration]);

  // Don't show anything if migration is not needed or already completed
  if (!needsMigration && migrationStatus === 'completed') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border p-4 z-50">
      {migrationStatus === 'checking' && (
        <div className="flex items-center gap-3">
          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          <div>
            <div className="font-medium">Checking currency data...</div>
            <div className="text-sm text-gray-600">Please wait</div>
          </div>
        </div>
      )}

      {migrationStatus === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <div className="font-medium">Currency Migration Required</div>
              <div className="text-sm text-gray-600">
                We need to update your data for proper multi-currency support
              </div>
            </div>
          </div>
          <button
            onClick={performMigration}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Start Migration
          </button>
        </div>
      )}

      {migrationStatus === 'running' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            <div>
              <div className="font-medium">Migrating Currency Data</div>
              <div className="text-sm text-gray-600">Please don't close this window</div>
            </div>
          </div>
          
          {migrationProgress.snapshots.total > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                Snapshots: {migrationProgress.snapshots.completed} / {migrationProgress.snapshots.total}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${(migrationProgress.snapshots.completed / migrationProgress.snapshots.total) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {migrationProgress.goals.total > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                Goals: {migrationProgress.goals.completed} / {migrationProgress.goals.total}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${(migrationProgress.goals.completed / migrationProgress.goals.total) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {migrationStatus === 'completed' && (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <div className="font-medium">Migration Complete</div>
            <div className="text-sm text-gray-600">
              Your data has been updated for multi-currency support
            </div>
          </div>
        </div>
      )}

      {migrationStatus === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-medium">Migration Error</div>
              <div className="text-sm text-gray-600">{error || 'An error occurred during migration'}</div>
            </div>
          </div>
          <button
            onClick={performMigration}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Migration
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencyMigration;