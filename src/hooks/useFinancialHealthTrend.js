import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useFinancialHealthTrend = () => {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) {
      setSnapshots([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [profileResult, snapshotResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single(),
        supabase
          .from('financial_health_snapshots')
          .select('id, created_at, score, grade, breakdown')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
      ]);

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw profileResult.error;
      }
      if (snapshotResult.error) throw snapshotResult.error;

      setSettings(profileResult.data?.settings || {});
      setSnapshots(snapshotResult.data || []);
    } catch (err) {
      console.error('Error loading health trend:', err);
      setError(err.message || 'Failed to load health trend');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    snapshots,
    settings,
    loading,
    error,
    reload: load
  };
};
