import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Target,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceArea
} from 'recharts';

// Months array defined outside component
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Chart colors
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

/**
 * Mobile-optimized Analytics View
 * Provides touch-friendly charts and insights
 */
const MobileAnalyticsView = ({
  selectedYear,
  selectedMonth,
  setSelectedMonth,
  setSelectedYear,
  accounts,
  goals,
  getSnapshotValue,
  formatCurrency,
  getCurrencySymbol,
  currency,
  multiYearData = {},
  healthTrend = [],
  healthSettings = null
}) => {
  const currentMonth = new Date().getMonth();
  const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : '$';
  const healthBands = [
    { from: 90, to: 100, color: '#dcfce7' },
    { from: 75, to: 90, color: '#e7f5ff' },
    { from: 60, to: 75, color: '#fef9c3' },
    { from: 45, to: 60, color: '#ffedd5' },
    { from: 0, to: 45, color: '#fee2e2' }
  ];

  // Smart formatting: shows full number with commas, abbreviates only for very large values
  const formatCompact = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000000) {
      // Billions
      const billions = value / 1000000000;
      return billions % 1 === 0 ? `${billions}B` : `${billions.toFixed(1)}B`;
    } else if (absValue >= 10000000) {
      // 10M+: abbreviate to M
      const millions = value / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    }
    // Show full number with commas
    return Math.round(value).toLocaleString();
  };

  // State
  const [activeChart, setActiveChart] = useState('networth'); // 'networth' | 'assets' | 'goals' | 'health'
  const [timeFrame, setTimeFrame] = useState('6M');
  const [netWorthView, setNetWorthView] = useState('progression'); // 'progression' | 'comparison'
  const [assetsView, setAssetsView] = useState('summary'); // 'summary' | 'detailed'
  const [goalsView, setGoalsView] = useState('list'); // 'list' | 'chart'

  useEffect(() => {
    if (netWorthView === 'comparison' && (timeFrame === '3M' || timeFrame === '6M')) {
      setTimeFrame('YTD');
    }
    if (netWorthView === 'progression' && (timeFrame === '3Y' || timeFrame === '5Y' || timeFrame === 'ALL')) {
      setTimeFrame('6M');
    }
  }, [netWorthView, timeFrame]);

  // Calculate totals for current month
  const totals = useMemo(() => {
    let assetTotal = 0;
    let liabilityTotal = 0;

    (accounts.assets || []).forEach(asset => {
      assetTotal += getSnapshotValue(asset.id, selectedMonth);
    });

    (accounts.liabilities || []).forEach(liability => {
      liabilityTotal += getSnapshotValue(liability.id, selectedMonth);
    });

    return {
      assets: assetTotal,
      liabilities: liabilityTotal,
      netWorth: assetTotal - liabilityTotal
    };
  }, [accounts, selectedMonth, getSnapshotValue]);

  // Calculate previous month totals for comparison
  const prevTotals = useMemo(() => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    let assetTotal = 0;
    let liabilityTotal = 0;

    (accounts.assets || []).forEach(asset => {
      assetTotal += getSnapshotValue(asset.id, prevMonth);
    });

    (accounts.liabilities || []).forEach(liability => {
      liabilityTotal += getSnapshotValue(liability.id, prevMonth);
    });

    return {
      assets: assetTotal,
      liabilities: liabilityTotal,
      netWorth: assetTotal - liabilityTotal
    };
  }, [accounts, selectedMonth, getSnapshotValue]);

  // Calculate change
  const change = {
    netWorth: totals.netWorth - prevTotals.netWorth,
    netWorthPercent: prevTotals.netWorth !== 0 ? ((totals.netWorth - prevTotals.netWorth) / Math.abs(prevTotals.netWorth)) * 100 : 0,
    assets: totals.assets - prevTotals.assets,
    assetsPercent: prevTotals.assets !== 0 ? ((totals.assets - prevTotals.assets) / prevTotals.assets) * 100 : 0,
    liabilities: totals.liabilities - prevTotals.liabilities,
    liabilitiesPercent: prevTotals.liabilities !== 0 ? ((totals.liabilities - prevTotals.liabilities) / prevTotals.liabilities) * 100 : 0
  };

  // Prepare chart data based on timeframe
  const chartData = useMemo(() => {
    const data = [];
    let monthsToShow = 6;

    switch (timeFrame) {
      case '3M': monthsToShow = 3; break;
      case '6M': monthsToShow = 6; break;
      case 'YTD': monthsToShow = currentMonth + 1; break;
      case '1Y': monthsToShow = 12; break;
      default: monthsToShow = 6;
    }

    for (let i = monthsToShow - 1; i >= 0; i--) {
      let monthIdx = selectedMonth - i;
      if (monthIdx < 0) {
        monthIdx += 12;
      }

      let assets = 0;
      let liabilities = 0;

      (accounts.assets || []).forEach(asset => {
        assets += getSnapshotValue(asset.id, monthIdx);
      });
      (accounts.liabilities || []).forEach(liability => {
        liabilities += getSnapshotValue(liability.id, monthIdx);
      });

      data.push({
        month: MONTHS[monthIdx],
        assets,
        liabilities,
        netWorth: assets - liabilities
      });
    }
    return data;
  }, [accounts, selectedMonth, getSnapshotValue, timeFrame, currentMonth]);

  const yearlyTrendData = useMemo(() => {
    if (!multiYearData || Object.keys(multiYearData).length === 0) return [];
    const years = Object.keys(multiYearData)
      .map((year) => parseInt(year, 10))
      .filter((year) => !Number.isNaN(year))
      .sort((a, b) => a - b);

    const findLatestMonth = (yearSnapshots) => {
      const months = new Set();
      Object.keys(yearSnapshots || {}).forEach((key) => {
        const parts = key.split('_');
        const monthIndex = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(monthIndex)) {
          months.add(monthIndex);
        }
      });
      if (months.size === 0) return null;
      return Math.max(...months);
    };

    return years
      .map((year) => {
        const yearData = multiYearData[year];
        if (!yearData?.snapshots) return null;
        const monthIndex = findLatestMonth(yearData.snapshots);
        if (monthIndex === null) return null;
        let assets = 0;
        let liabilities = 0;

        (accounts.assets || []).forEach(asset => {
          const key = `${asset.id}_${monthIndex}`;
          assets += yearData.snapshots[key] || 0;
        });
        (accounts.liabilities || []).forEach(liability => {
          const key = `${liability.id}_${monthIndex}`;
          liabilities += yearData.snapshots[key] || 0;
        });

        if (assets === 0 && liabilities === 0) {
          return null;
        }

        return {
          year: year.toString(),
          assets,
          liabilities,
          netWorth: assets - liabilities
        };
      })
      .filter(Boolean);
  }, [multiYearData, accounts]);

  const calculateTotalsForYearMonth = useCallback((year, monthIndex) => {
    let assetTotal = 0;
    let liabilityTotal = 0;

    const yearSnapshots = multiYearData?.[year]?.snapshots || {};
    const accountTypeMap = multiYearData?.accountTypeMap || {};

    if (year === selectedYear) {
      (accounts.assets || []).forEach(asset => {
        assetTotal += getSnapshotValue(asset.id, monthIndex);
      });
      (accounts.liabilities || []).forEach(liability => {
        liabilityTotal += getSnapshotValue(liability.id, monthIndex);
      });
    } else {
      Object.keys(yearSnapshots).forEach((key) => {
        if (!key.endsWith(`_${monthIndex}`)) return;
        const parts = key.split('_');
        const accountId = parts[0];
        const value = yearSnapshots[key] || 0;
        const accountType = accountTypeMap[accountId];

        if (accountType === 'asset') {
          assetTotal += value;
        } else if (accountType === 'liability') {
          liabilityTotal += value;
        } else if (value >= 0) {
          assetTotal += value;
        } else {
          liabilityTotal += Math.abs(value);
        }
      });
    }

    return {
      assets: assetTotal,
      liabilities: liabilityTotal,
      netWorth: assetTotal - liabilityTotal
    };
  }, [accounts.assets, accounts.liabilities, getSnapshotValue, multiYearData, selectedYear]);

  const comparisonChartData = useMemo(() => {
    if (netWorthView !== 'comparison') {
      return { chartData: [], years: [], chartType: 'monthly' };
    }

    const baseYear = selectedYear;
    const realCurrentYear = new Date().getFullYear();
    const availableYears = Object.keys(multiYearData || {})
      .map((year) => parseInt(year, 10))
      .filter((year) => !Number.isNaN(year));

    let yearsToCompare = [];
    switch (timeFrame) {
      case 'YTD':
      case '1Y':
        yearsToCompare = [baseYear - 2, baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
        break;
      case '3Y':
        yearsToCompare = [baseYear - 2, baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
        break;
      case '5Y':
        yearsToCompare = [baseYear - 4, baseYear - 3, baseYear - 2, baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
        break;
      case 'ALL':
        yearsToCompare = availableYears.filter(y => y <= baseYear && y <= realCurrentYear);
        break;
      default:
        yearsToCompare = [baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
    }

    const yearsWithData = yearsToCompare.filter(year =>
      year === selectedYear || multiYearData?.[year]
    );

    const isMonthlyChart = timeFrame === 'YTD' || timeFrame === '1Y';

    if (!yearsWithData.length) {
      return { chartData: [], years: [], chartType: isMonthlyChart ? 'monthly' : 'annual' };
    }

    if (isMonthlyChart) {
      const monthLimit = timeFrame === 'YTD' && selectedYear === realCurrentYear
        ? currentMonth + 1
        : 12;
      const chartData = [];

      for (let monthIdx = 0; monthIdx < monthLimit; monthIdx += 1) {
        const dataPoint = { month: MONTHS[monthIdx] };
        yearsWithData.forEach((year) => {
          const totals = calculateTotalsForYearMonth(year, monthIdx);
          if (totals.netWorth !== 0) {
            dataPoint[`netWorth_${year}`] = totals.netWorth;
          }
        });
        chartData.push(dataPoint);
      }

      return { chartData, years: yearsWithData, chartType: 'monthly' };
    }

    const annualData = yearsWithData
      .map((year) => {
        const entry = yearlyTrendData.find((item) => parseInt(item.year, 10) === year);
        return entry ? { year: entry.year, netWorth: entry.netWorth } : null;
      })
      .filter(Boolean)
      .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

    return { chartData: annualData, years: yearsWithData, chartType: 'annual' };
  }, [netWorthView, selectedYear, timeFrame, multiYearData, currentMonth, calculateTotalsForYearMonth, yearlyTrendData]);

  // Asset distribution data with "Other" grouping
  const assetBreakdownData = useMemo(() => {
    const breakdown = [];
    let totalValue = 0;

    (accounts.assets || []).forEach(asset => {
      const value = getSnapshotValue(asset.id, selectedMonth);
      if (value > 0) {
        breakdown.push({ name: asset.name, value });
        totalValue += value;
      }
    });

    breakdown.sort((a, b) => b.value - a.value);
    return { breakdown, totalValue };
  }, [accounts.assets, selectedMonth, getSnapshotValue]);

  const assetSummaryData = useMemo(() => {
    const { breakdown, totalValue } = assetBreakdownData;
    if (!breakdown.length) return { majorAssets: [], minorAssets: [], totalValue: 0 };

    const threshold = totalValue * 0.05;
    const majorAssets = [];
    const minorAssets = [];

    breakdown.forEach(asset => {
      if (asset.value >= threshold) {
        majorAssets.push(asset);
      } else {
        minorAssets.push(asset);
      }
    });

    if (minorAssets.length > 0) {
      const otherTotal = minorAssets.reduce((sum, asset) => sum + asset.value, 0);
      majorAssets.push({
        name: 'Other',
        value: otherTotal,
        isOther: true,
        count: minorAssets.length
      });
    }

    return { majorAssets, minorAssets, totalValue };
  }, [assetBreakdownData]);

  // Goal progress data
  const goalProgress = useMemo(() => {
    return (goals || []).map(goal => {
      const current = Math.max(0, parseFloat(goal.current_amount) || 0);
      const target = Math.max(0.01, parseFloat(goal.target_amount) || 0.01);
      const percentage = Math.round((current / target) * 100);

      return {
        name: goal.name,
        current,
        target,
        percentage,
        remaining: Math.max(0, target - current)
      };
    }).filter(g => g.target > 0.01);
  }, [goals]);

  const goalChartData = useMemo(() => {
    return goalProgress.map((goal, index) => ({
      name: goal.name && goal.name.length > 10 ? `${goal.name.slice(0, 10)}...` : goal.name,
      fullName: goal.name,
      completion: goal.percentage,
      color: goal.percentage >= 100 ? '#10b981' : goal.percentage >= 50 ? '#f59e0b' : '#3b82f6',
      index
    }));
  }, [goalProgress]);

  const latestHealth = healthTrend && healthTrend.length > 0
    ? healthTrend[healthTrend.length - 1]
    : null;

  // Render change indicator
  const renderChangeIndicator = (value, percent, inverse = false) => {
    const isPositive = inverse ? value < 0 : value > 0;

    if (value === 0) {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <Minus className="w-3 h-3" />
          <span className="text-xs">No change</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3" />
        ) : (
          <ArrowDownRight className="w-3 h-3" />
        )}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{currencySymbol}{formatCompact(value)} ({percent.toFixed(1)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-20">
      {/* Quick Insights - Compact */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-3 text-white">
        <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          Quick Insights
        </h3>
        <div className="space-y-1.5 text-xs">
          {totals.netWorth !== 0 && (
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/60" />
              Your net worth is <span className="font-semibold">{formatCurrency(totals.netWorth)}</span>
            </p>
          )}
          {totals.liabilities > 0 && totals.assets > 0 && (
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/60" />
              Debt-to-asset ratio: <span className="font-semibold">{((totals.liabilities / totals.assets) * 100).toFixed(1)}%</span>
            </p>
          )}
          {change.netWorth !== 0 && (
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/60" />
              {change.netWorth > 0 ? 'Grew' : 'Decreased'} by <span className="font-semibold">{currencySymbol}{formatCompact(Math.abs(change.netWorth))}</span> this month
            </p>
          )}
          {goalProgress.length > 0 && (
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/60" />
              {goalProgress.filter(g => g.percentage >= 100).length} of {goalProgress.length} goals completed
            </p>
          )}
        </div>
      </div>

      {/* Summary Cards with Currency Symbol - Compact */}
      <div className="grid grid-cols-1 gap-2">
        {/* Net Worth Card */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-lg"
        >
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <p className="text-blue-100 text-xs">Net Worth</p>
              <p className="text-xl font-bold">{formatCurrency(totals.netWorth)}</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-blue-100">
            {change.netWorth >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span className="text-xs">
              {change.netWorth >= 0 ? '+' : ''}{currencySymbol}{formatCompact(change.netWorth)} from last month
            </span>
          </div>
        </motion.div>

        {/* Assets & Liabilities Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Assets</span>
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {currencySymbol}{formatCompact(totals.assets)}
            </p>
            {renderChangeIndicator(change.assets, change.assetsPercent)}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Liabilities</span>
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {currencySymbol}{formatCompact(totals.liabilities)}
            </p>
            {renderChangeIndicator(change.liabilities, change.liabilitiesPercent, true)}
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 overflow-x-auto">
        <button
          onClick={() => setActiveChart('networth')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 min-w-[60px] ${
            activeChart === 'networth'
              ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          Trend
        </button>
        <button
          onClick={() => setActiveChart('assets')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 min-w-[60px] ${
            activeChart === 'assets'
              ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <PieChartIcon className="w-3 h-3" />
          Assets
        </button>
        <button
          onClick={() => setActiveChart('goals')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 min-w-[60px] ${
            activeChart === 'goals'
              ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Target className="w-3 h-3" />
          Goals
        </button>
        <button
          onClick={() => setActiveChart('health')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 min-w-[60px] ${
            activeChart === 'health'
              ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Activity className="w-3 h-3" />
          Health
        </button>
      </div>

      {/* Time Frame Selector */}
      {activeChart === 'networth' && (
        <div className="flex gap-1.5 justify-center">
          {(netWorthView === 'progression'
            ? ['3M', '6M', 'YTD', '1Y']
            : ['YTD', '1Y', '3Y', '5Y', 'ALL']
          ).map((period) => (
            <button
              key={period}
              onClick={() => setTimeFrame(period)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                timeFrame === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      )}

      {/* Charts */}
      <AnimatePresence mode="wait">
        {activeChart === 'networth' && (
          <motion.div
            key="networth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Net Worth Analytics
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5 text-[10px]">
                <button
                  onClick={() => setNetWorthView('progression')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    netWorthView === 'progression'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Progression
                </button>
                <button
                  onClick={() => setNetWorthView('comparison')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    netWorthView === 'comparison'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Comparison
                </button>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                {netWorthView === 'progression' ? (
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="liabilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                      tickFormatter={(value) => `${currencySymbol}${formatCompact(value)}`}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '8px',
                        color: 'var(--tooltip-text)',
                        fontSize: '12px'
                      }}
                      formatter={(value, name) => [formatCurrency(value), name]}
                      labelStyle={{ color: 'var(--tooltip-text)' }}
                      itemStyle={{ color: 'var(--tooltip-text)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="assets"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#assetsGradient)"
                      name="Assets"
                    />
                    <Area
                      type="monotone"
                      dataKey="liabilities"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#liabilitiesGradient)"
                      name="Liabilities"
                    />
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      name="Net Worth"
                    />
                  </ComposedChart>
                ) : comparisonChartData.chartData.length > 0 ? (
                  comparisonChartData.chartType === 'monthly' ? (
                    <LineChart data={comparisonChartData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                        tickFormatter={(value) => `${currencySymbol}${formatCompact(value)}`}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--tooltip-bg)',
                          border: '1px solid var(--tooltip-border)',
                          borderRadius: '8px',
                          color: 'var(--tooltip-text)',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => {
                          if (typeof name === 'string' && name.startsWith('netWorth_')) {
                            const year = name.replace('netWorth_', '');
                            return [formatCurrency(value), year];
                          }
                          return [formatCurrency(value), name];
                        }}
                        labelStyle={{ color: 'var(--tooltip-text)' }}
                        itemStyle={{ color: 'var(--tooltip-text)' }}
                      />
                      {(comparisonChartData.years || []).map((year, index) => (
                        <Line
                          key={year}
                          type="monotone"
                          dataKey={`netWorth_${year}`}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <LineChart data={comparisonChartData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                        tickFormatter={(value) => `${currencySymbol}${formatCompact(value)}`}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--tooltip-bg)',
                          border: '1px solid var(--tooltip-border)',
                          borderRadius: '8px',
                          color: 'var(--tooltip-text)',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [formatCurrency(value), 'Net Worth']}
                        labelStyle={{ color: 'var(--tooltip-text)' }}
                        itemStyle={{ color: 'var(--tooltip-text)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="netWorth"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        name="Net Worth"
                      />
                    </LineChart>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    Add multi-year data to compare net worth.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
            {netWorthView === 'progression' && (
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Assets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Liabilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Net Worth</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeChart === 'assets' && (
          <motion.div
            key="assets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-green-500" />
                Asset Distribution
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5 text-[10px]">
                <button
                  onClick={() => setAssetsView('summary')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    assetsView === 'summary'
                      ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setAssetsView('detailed')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    assetsView === 'detailed'
                      ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
            {assetBreakdownData.breakdown.length > 0 ? (
              <>
                {assetsView === 'summary' ? (
                  <>
                    <div className="h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetSummaryData.majorAssets}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                          >
                            {assetSummaryData.majorAssets.map((entry, index) => (
                              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--tooltip-bg)',
                              border: '1px solid var(--tooltip-border)',
                              borderRadius: '8px',
                              color: 'var(--tooltip-text)',
                              fontSize: '12px'
                            }}
                            formatter={(value, name, props) => {
                              if (props.payload?.isOther) {
                                return [formatCurrency(value), `${name} (${props.payload.count} assets)`];
                              }
                              return [formatCurrency(value), name];
                            }}
                            labelStyle={{ color: 'var(--tooltip-text)' }}
                            itemStyle={{ color: 'var(--tooltip-text)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">Total</div>
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {currencySymbol}{formatCompact(assetSummaryData.totalValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {assetSummaryData.majorAssets.slice(0, 5).map((asset, index) => {
                        const percentage = assetSummaryData.totalValue > 0
                          ? (asset.value / assetSummaryData.totalValue) * 100
                          : 0;
                        return (
                          <div key={asset.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                {asset.isOther ? `${asset.name} (${asset.count})` : asset.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {currencySymbol}{formatCompact(asset.value)}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {assetSummaryData.majorAssets.length > 5 && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          +{assetSummaryData.majorAssets.length - 5} more assets
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const maxValue = Math.max(...assetBreakdownData.breakdown.map(asset => asset.value));
                      return assetBreakdownData.breakdown.slice(0, 8).map((asset, index) => {
                        const barWidth = maxValue > 0 ? (asset.value / maxValue) * 100 : 0;
                        const percentage = assetSummaryData.totalValue > 0
                          ? (asset.value / assetSummaryData.totalValue) * 100
                          : 0;
                        return (
                          <div key={asset.name}>
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span className="truncate max-w-[140px]">{asset.name}</span>
                              <span className="text-gray-900 dark:text-gray-100">
                                {currencySymbol}{formatCompact(asset.value)} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${barWidth}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {assetBreakdownData.breakdown.length > 8 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{assetBreakdownData.breakdown.length - 8} more assets
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No asset data available</p>
              </div>
            )}
          </motion.div>
        )}

        {activeChart === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-500" />
                Goal Progress
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5 text-[10px]">
                <button
                  onClick={() => setGoalsView('list')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    goalsView === 'list'
                      ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setGoalsView('chart')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    goalsView === 'chart'
                      ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Chart
                </button>
              </div>
            </div>
            {goalProgress.length > 0 ? (
              goalsView === 'list' ? (
                <div className="space-y-4">
                  {goalProgress.map((goal, index) => (
                    <div key={goal.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[60%]">
                          {goal.name}
                        </span>
                        <span className={`text-sm font-semibold ${
                          goal.percentage >= 100
                            ? 'text-green-600'
                            : goal.percentage >= 50
                            ? 'text-yellow-600'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {goal.percentage}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(goal.percentage, 100)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-full rounded-full ${
                            goal.percentage >= 100
                              ? 'bg-green-500'
                              : goal.percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{currencySymbol}{formatCompact(goal.current)} saved</span>
                        <span>{currencySymbol}{formatCompact(goal.remaining)} to go</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                        interval={0}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--tooltip-bg)',
                          border: '1px solid var(--tooltip-border)',
                          borderRadius: '8px',
                          color: 'var(--tooltip-text)',
                          fontSize: '12px'
                        }}
                        formatter={(value, name, props) => {
                          const data = props.payload;
                          return [`${value}%`, data.fullName || 'Goal'];
                        }}
                        labelStyle={{ color: 'var(--tooltip-text)' }}
                        itemStyle={{ color: 'var(--tooltip-text)' }}
                      />
                      <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                        {goalChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mb-2 opacity-30" />
                <p>No goals set yet</p>
                <p className="text-xs mt-1">Add goals in the Netsheet tab</p>
              </div>
            )}
          </motion.div>
        )}

        {activeChart === 'health' && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Financial Health
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">Score trend</span>
            </div>
            {healthTrend && healthTrend.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthTrend}>
                      <defs>
                        <linearGradient id="healthScoreGradientMobile" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      {healthBands.map((band) => (
                        <ReferenceArea
                          key={`${band.from}-${band.to}`}
                          y1={band.from}
                          y2={band.to}
                          fill={band.color}
                          fillOpacity={0.35}
                          strokeOpacity={0}
                        />
                      ))}
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--tooltip-bg)',
                          border: '1px solid var(--tooltip-border)',
                          borderRadius: '8px',
                          color: 'var(--tooltip-text)',
                          fontSize: '12px'
                        }}
                        formatter={(value, name, props) => {
                          const grade = props?.payload?.grade;
                          return [`${value}/100`, grade ? `Score (${grade})` : 'Score'];
                        }}
                        labelStyle={{ color: 'var(--tooltip-text)' }}
                        itemStyle={{ color: 'var(--tooltip-text)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fill="url(#healthScoreGradientMobile)"
                        name="Score"
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#2563eb' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {latestHealth && (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950/40 rounded-lg px-2.5 py-2">
                      <span>Grade</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{latestHealth.grade}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950/40 rounded-lg px-2.5 py-2">
                      <span>Score</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{latestHealth.score}/100</span>
                    </div>
                  </div>
                )}
                {latestHealth?.breakdown && (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-center">
                      {latestHealth.breakdown?.liquidity?.monthsOfRunway ?? '--'} mo runway
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-center">
                      {latestHealth.breakdown?.savings?.savingsRate ?? '--'}% savings
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-center">
                      {latestHealth.breakdown?.solvency?.debtToIncomeRatio ?? '--'}% DTI
                    </div>
                  </div>
                )}
                {healthSettings?.diagnosticReminder?.nextReminderAt && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Next reminder: {new Date(healthSettings.diagnosticReminder.nextReminderAt).toLocaleDateString()}
                  </div>
                )}
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Activity className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">Run the diagnostic to see your score trend</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileAnalyticsView;
