# Multi-Currency Migration Guide

## Overview
This guide explains how to apply the multi-currency feature that enables true currency conversion with original value preservation.

## Database Migration

### Step 1: Apply the Database Migration
Run the migration script located at `supabase/migrations/add_currency_support.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/add_currency_support.sql`
4. Execute the script

This will:
- Add `original_value`, `original_currency`, and `entry_date` columns to `account_snapshots`
- Add currency columns to `goals` table
- Add `preferred_currency` to user profiles
- Create a `currency_conversions` audit table
- Migrate existing data to the new structure (assuming USD as default)

## Application Changes

### New Features Added:

1. **Enhanced Currency Conversion System** (`src/utils/currencyConversion.js`)
   - Real-time currency conversion using exchange rates
   - Original value preservation
   - Batch conversion for performance
   - Caching system for offline support

2. **Updated Data Hook** (`src/hooks/useFinancialDataWithCurrency.js`)
   - Replaces the original `useFinancialData` hook
   - Handles currency conversion automatically
   - Preserves original values while displaying converted amounts
   - Supports currency switching without data loss

3. **Automatic Migration Component** (`src/components/common/CurrencyMigration.jsx`)
   - Automatically detects and migrates legacy data
   - Shows progress during migration
   - One-time process that runs on first load

4. **UI Enhancements**
   - Hover tooltips showing original values when converted
   - Currency indicators on all monetary values
   - Seamless currency switching in settings

## How It Works

### Data Structure
Each monetary value now stores:
- `originalValue`: The amount in the original currency
- `originalCurrency`: The currency code when entered
- `displayValue`: The converted amount for display
- `displayCurrency`: The current display currency
- `entryDate`: When the value was entered

### Currency Switching
When you switch currencies:
1. All values are converted from their original currencies to the new display currency
2. Original values are never modified
3. You can switch back and forth without losing precision
4. Exchange rates are cached for 5 minutes for performance

### Example Flow
1. User enters $1000 USD in savings
2. System stores: `originalValue: 1000, originalCurrency: 'USD'`
3. User switches to EUR display
4. System converts and shows: €920 (with hover showing "Originally $1000")
5. User switches to GBP
6. System converts and shows: £766 (with hover showing "Originally $1000")
7. User switches back to USD
8. System shows: $1000 (no conversion needed)

## Testing Instructions

1. **Test Migration**:
   - Load the app with existing data
   - The migration component will appear and auto-migrate
   - Check that all values are preserved

2. **Test Currency Switching**:
   - Go to Profile > Currency Settings
   - Change currency
   - Verify all values update
   - Hover over values to see original amounts

3. **Test New Data Entry**:
   - Add new assets/liabilities in current currency
   - Switch currency
   - Verify new entries convert correctly

4. **Test Preservation**:
   - Note some values
   - Switch currencies multiple times
   - Switch back to original
   - Verify values match exactly

## Troubleshooting

### If migration fails:
1. Check browser console for errors
2. Ensure database migration was applied
3. Click "Retry Migration" in the notification
4. Clear localStorage and refresh if needed

### If values don't convert:
1. Check internet connection (needed for exchange rates)
2. Verify currency is supported in settings
3. Check browser console for API errors
4. Exchange rates cache for 5 minutes - wait or clear cache

## Notes
- Exchange rates from exchangerate-api.com (free tier: 1500 requests/month)
- Rates cached for 5 minutes to minimize API calls
- Works offline using cached rates
- Migration assumes USD for legacy data (configurable in code)