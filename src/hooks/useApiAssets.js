/**
 * Hook for managing API-integrated assets
 * Handles fetching, updating, and calculating values for stocks, crypto, and real estate
 */

import { useState, useEffect, useCallback } from 'react';
import { financialDataAPI, ASSET_TYPES } from '../utils/api/financialDataAPI';
import { supabase } from '../lib/supabase';

export const useApiAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [yearId, setYearId] = useState(null);

  // Get current year ID
  useEffect(() => {
    const getYearId = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: yearData } = await supabase
          .from('financial_years')
          .select('id')
          .eq('user_id', user.id)
          .eq('year', currentYear)
          .single();

        if (yearData) {
          setYearId(yearData.id);
        }
      } catch (err) {
        console.error('Error getting year ID:', err);
      }
    };

    getYearId();
  }, []);

  // Fetch all API-linked assets for the year
  const fetchApiAssets = useCallback(async () => {
    if (!yearId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('year_id', yearId)
        .in('asset_type', ['stock', 'crypto', 'etf', 'real_estate', 'mutual_fund', 'bond', 'commodity'])
        .eq('auto_update', true);

      if (error) throw error;

      setAssets(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching API assets:', err);
    } finally {
      setLoading(false);
    }
  }, [yearId]);

  // Update prices for all API assets
  const updateAllPrices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedAssets = await Promise.all(
        assets.map(async (asset) => {
          if (!asset.api_symbol || asset.asset_type === ASSET_TYPES.MANUAL) {
            return asset;
          }

          const priceData = await financialDataAPI.getPrice(
            asset.asset_type,
            asset.api_symbol
          );

          if (priceData) {
            const { data: updated, error } = await supabase
              .from('accounts')
              .update({
                last_price: priceData.price,
                last_price_updated: new Date().toISOString()
              })
              .eq('id', asset.id)
              .select()
              .single();

            if (!error && updated) {
              // Update the account snapshot with new value
              const newValue = financialDataAPI.calculateValue(
                asset.quantity,
                priceData.price
              );

              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();

              await supabase
                .from('account_snapshots')
                .upsert({
                  account_id: asset.id,
                  month: currentMonth,
                  year: currentYear,
                  value: newValue
                }, {
                  onConflict: 'account_id,month,year'
                });

              return { ...asset, ...updated, current_value: newValue };
            }
          }

          return asset;
        })
      );

      setAssets(updatedAssets);
    } catch (err) {
      setError(err.message);
      console.error('Error updating prices:', err);
    } finally {
      setLoading(false);
    }
  }, [assets]);

  // Add a new API-linked asset
  const addApiAsset = useCallback(async (assetData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current price if symbol provided
      let currentPrice = assetData.last_price || 0;
      if (assetData.api_symbol && assetData.asset_type !== ASSET_TYPES.MANUAL) {
        const priceData = await financialDataAPI.getPrice(
          assetData.asset_type,
          assetData.api_symbol
        );
        if (priceData) {
          currentPrice = priceData.price;
        }
      }

      // Create the account
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          year_id: yearId,
          name: assetData.name,
          type: assetData.type, // 'asset' or 'liability'
          asset_type: assetData.asset_type,
          api_symbol: assetData.api_symbol,
          api_provider: assetData.api_provider,
          quantity: assetData.quantity,
          last_price: currentPrice,
          last_price_updated: new Date().toISOString(),
          auto_update: assetData.auto_update,
          icon: assetData.icon
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // Calculate initial value
      let value = 0;
      if (assetData.quantity && currentPrice) {
        value = financialDataAPI.calculateValue(
          assetData.quantity,
          currentPrice
        );

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        await supabase
          .from('account_snapshots')
          .insert({
            account_id: account.id,
            month: currentMonth,
            year: currentYear,
            value: value
          });
      }

      setAssets(prev => [...prev, { ...account, current_value: value }]);
      return account;
    } catch (err) {
      setError(err.message);
      console.error('Error adding API asset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [yearId]);

  // Update asset quantity
  const updateAssetQuantity = useCallback(async (assetId, quantity) => {
    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) throw new Error('Asset not found');

      const { error } = await supabase
        .from('accounts')
        .update({ quantity })
        .eq('id', assetId);

      if (error) throw error;

      // Update snapshot with new calculated value
      if (asset.last_price) {
        const newValue = financialDataAPI.calculateValue(quantity, asset.last_price);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        await supabase
          .from('account_snapshots')
          .upsert({
            account_id: assetId,
            month: currentMonth,
            year: currentYear,
            value: newValue
          }, {
            onConflict: 'account_id,month,year'
          });

        setAssets(prev =>
          prev.map(a =>
            a.id === assetId
              ? { ...a, quantity, current_value: newValue }
              : a
          )
        );
      } else {
        setAssets(prev =>
          prev.map(a =>
            a.id === assetId ? { ...a, quantity } : a
          )
        );
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating quantity:', err);
    }
  }, [assets]);

  // Search for assets by symbol or name
  const searchAssets = useCallback(async (query, types = ['stock', 'crypto']) => {
    setSearchLoading(true);
    try {
      const results = await financialDataAPI.searchAssets(query, types);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      console.error('Error searching assets:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Toggle auto-update for an asset
  const toggleAutoUpdate = useCallback(async (assetId, enabled) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ auto_update: enabled })
        .eq('id', assetId);

      if (error) throw error;

      setAssets(prev =>
        prev.map(a =>
          a.id === assetId ? { ...a, auto_update: enabled } : a
        )
      );
    } catch (err) {
      setError(err.message);
      console.error('Error toggling auto-update:', err);
    }
  }, []);

  // Calculate total value of all API assets
  const getTotalValue = useCallback(() => {
    return assets.reduce((total, asset) => {
      if (asset.type === 'liability') {
        return total - (asset.current_value || 0);
      }
      return total + (asset.current_value || 0);
    }, 0);
  }, [assets]);

  // Fetch assets on component mount
  useEffect(() => {
    if (yearId) {
      fetchApiAssets();
    }
  }, [fetchApiAssets, yearId]);

  // Auto-update prices every 5 minutes for auto-update enabled assets
  useEffect(() => {
    const interval = setInterval(() => {
      const autoUpdateAssets = assets.filter(a => a.auto_update);
      if (autoUpdateAssets.length > 0) {
        updateAllPrices();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [assets, updateAllPrices]);

  return {
    assets,
    loading,
    error,
    searchResults,
    searchLoading,
    fetchApiAssets,
    updateAllPrices,
    addApiAsset,
    updateAssetQuantity,
    searchAssets,
    toggleAutoUpdate,
    getTotalValue
  };
};