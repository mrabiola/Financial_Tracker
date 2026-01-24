import React, { useState, useMemo } from 'react';
import { Edit2 } from 'lucide-react';
import MiniSparkline from './MiniSparkline';
import TrendIndicator from './TrendIndicator';
import AccountTrendSelector from './AccountTrendSelector';
import {
  detectAccountCategory,
  formatMetadataForDisplay
} from '../../utils/accountMetadataUtils';
import {
  getTrendData,
  getMonthOverMonthTrend
} from '../../utils/accountTrendUtils';

/**
 * AccountDetailContent - Shared detail view content for account drill-down
 * Used by both desktop row expansion and mobile bottom sheet
 *
 * Desktop Layout: Horizontal grid using all available space efficiently
 * Mobile Layout: Vertical stack for touch interface
 */
const AccountDetailContent = ({
  account,
  accountType = 'asset',
  currentValue = 0,
  selectedMonth = 0,
  selectedYear = new Date().getFullYear(),
  getSnapshotValue,
  formatCurrency = (v) => `$${v.toLocaleString()}`,
  formatCurrencyShort = (v) => `$${v.toLocaleString()}`,
  getCurrencySymbol = () => '$',
  currency = 'USD',
  onUpdateMetadata = () => {},
  onOpenFullModal = () => {},
  isMobile = false
}) => {
  const [trendPeriod, setTrendPeriod] = useState('6M');

  // Detect account category from name
  const accountCategory = useMemo(
    () => detectAccountCategory(account.name, accountType),
    [account.name, accountType]
  );

  // Get formatted metadata for display
  const metadataDisplay = useMemo(
    () => formatMetadataForDisplay(account.metadata || {}, accountCategory),
    [account.metadata, accountCategory]
  );

  // Get trend data
  const trendData = useMemo(
    () => getTrendData(account.id, getSnapshotValue, selectedMonth, trendPeriod),
    [account.id, getSnapshotValue, selectedMonth, trendPeriod]
  );

  // Get month-over-month trend
  const momTrend = useMemo(
    () => getMonthOverMonthTrend(account.id, getSnapshotValue, selectedMonth),
    [account.id, getSnapshotValue, selectedMonth]
  );

  // Determine color based on account type and value
  const getColor = () => {
    if (accountType === 'asset') {
      return trendData.isPositive ? 'green' : 'red';
    }
    return !trendData.isPositive ? 'green' : 'red';
  };

  const trendColor = getColor();
  const colorMap = {
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6'
  };

  // Mobile: Vertical layout for touch
  if (isMobile) {
    return (
      <div className="account-detail-content">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${accountType === 'asset' ? 'text-green-600' : 'text-red-600'}`}>
                {accountType === 'asset' ? 'Asset' : 'Liability'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrencyShort(currentValue)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {account.name}
            </h3>
          </div>
          <button
            onClick={() => onOpenFullModal(account)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Details
          </button>
        </div>

        {/* Trend Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Trend ({trendPeriod})
            </h4>
            <AccountTrendSelector
              selectedPeriod={trendPeriod}
              onSelect={setTrendPeriod}
              size="sm"
            />
          </div>

          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <MiniSparkline
              data={trendData.history}
              color={colorMap[trendColor]}
              height={80}
              period={trendPeriod}
              formatCurrency={formatCurrency}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                {trendPeriod} Change
              </div>
              <TrendIndicator
                currentValue={trendData.currentValue}
                previousValue={trendData.previousValue}
                inverse={accountType === 'liability'}
                formatCurrency={formatCurrency}
                size="sm"
              />
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                Month over Month
              </div>
              <TrendIndicator
                currentValue={momTrend.currentValue}
                previousValue={momTrend.previousValue}
                inverse={accountType === 'liability'}
                formatCurrency={formatCurrency}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        {(metadataDisplay.length > 0 || accountCategory !== 'general') && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Details
            </h4>

            {metadataDisplay.length > 0 ? (
              <div className="space-y-2">
                {metadataDisplay.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className={`p-1.5 rounded-md ${accountType === 'asset'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {item.label}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No details added yet
                </p>
                <button
                  onClick={() => onOpenFullModal(account)}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  Add details
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Chart full-width at top, details in horizontal grid below
  return (
    <div className="account-detail-content">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${accountType === 'asset' ? 'text-green-600' : 'text-red-600'}`}>
              {accountType === 'asset' ? 'Asset' : 'Liability'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatCurrencyShort(currentValue)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {account.name}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <AccountTrendSelector
            selectedPeriod={trendPeriod}
            onSelect={setTrendPeriod}
            size="sm"
          />
          <button
            onClick={() => onOpenFullModal(account)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Details
          </button>
        </div>
      </div>

      {/* Chart Section - Full Width */}
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <MiniSparkline
          data={trendData.history}
          color={colorMap[trendColor]}
          height={100}
          period={trendPeriod}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Details Grid - Horizontal layout using all space */}
      <div className="grid grid-cols-6 gap-2">
        {/* Period Change */}
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
            {trendPeriod} Change
          </div>
          <TrendIndicator
            currentValue={trendData.currentValue}
            previousValue={trendData.previousValue}
            inverse={accountType === 'liability'}
            formatCurrency={formatCurrency}
            size="sm"
          />
        </div>

        {/* Month Over Month */}
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
            Month over Month
          </div>
          <TrendIndicator
            currentValue={momTrend.currentValue}
            previousValue={momTrend.previousValue}
            inverse={accountType === 'liability'}
            formatCurrency={formatCurrency}
            size="sm"
          />
        </div>

        {/* Current Value */}
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
            Current Value
          </div>
          <div className={`text-base font-semibold ${trendData.isPositive === (accountType === 'asset') ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(trendData.currentValue)}
          </div>
        </div>

        {/* Period Start */}
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
            {trendPeriod} Start
          </div>
          <div className="text-base font-semibold text-gray-700 dark:text-gray-300">
            {formatCurrency(trendData.previousValue)}
          </div>
        </div>

        {/* Metadata items - fill remaining cells */}
        {metadataDisplay.slice(0, 6).map((item) => (
          <div key={item.key} className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className={`p-0.5 rounded ${accountType === 'asset'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600'
              }`}>
                <item.icon className="w-3 h-3" />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex-1">
                {item.label}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={item.value}>
              {item.value}
            </div>
          </div>
        ))}

        {/* Empty state / Add more */}
        {metadataDisplay.length === 0 && (
          <div className="col-span-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
              No details
            </p>
            <button
              onClick={() => onOpenFullModal(account)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + Add
            </button>
          </div>
        )}

        {metadataDisplay.length > 0 && metadataDisplay.length < 6 && (
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
            <button
              onClick={() => onOpenFullModal(account)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetailContent;
