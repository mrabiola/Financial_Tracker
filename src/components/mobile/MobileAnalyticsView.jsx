import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  BarChart,
  Bar
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
  formatCurrencyShort,
  getCurrencySymbol,
  currency
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : '$';

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
  const [activeChart, setActiveChart] = useState('networth'); // 'networth' | 'comparison' | 'assets' | 'goals'
  const [timeFrame, setTimeFrame] = useState('6M');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

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

  // Asset distribution data
  const assetDistribution = useMemo(() => {
    return (accounts.assets || [])
      .map(asset => ({
        name: asset.name,
        value: getSnapshotValue(asset.id, selectedMonth)
      }))
      .filter(asset => asset.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [accounts, selectedMonth, getSnapshotValue]);

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

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

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
    <div className="space-y-4 pb-20">
      {/* Quick Insights - MOVED TO TOP */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Quick Insights
        </h3>
        <div className="space-y-2 text-sm">
          {totals.netWorth !== 0 && (
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              Your net worth is <span className="font-semibold">{formatCurrency(totals.netWorth)}</span>
            </p>
          )}
          {totals.liabilities > 0 && totals.assets > 0 && (
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              Debt-to-asset ratio: <span className="font-semibold">{((totals.liabilities / totals.assets) * 100).toFixed(1)}%</span>
            </p>
          )}
          {change.netWorth !== 0 && (
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {change.netWorth > 0 ? 'Grew' : 'Decreased'} by <span className="font-semibold">{currencySymbol}{formatCompact(Math.abs(change.netWorth))}</span> this month
            </p>
          )}
          {goalProgress.length > 0 && (
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {goalProgress.filter(g => g.percentage >= 100).length} of {goalProgress.length} goals completed
            </p>
          )}
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setShowMonthPicker(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Summary Cards with Currency Symbol */}
      <div className="grid grid-cols-1 gap-3">
        {/* Net Worth Card */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-blue-100 text-sm">Net Worth</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.netWorth)}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-blue-100">
            {change.netWorth >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span className="text-sm">
              {change.netWorth >= 0 ? '+' : ''}{currencySymbol}{formatCompact(change.netWorth)} from last month
            </span>
          </div>
        </motion.div>

        {/* Assets & Liabilities Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Assets</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currencySymbol}{formatCompact(totals.assets)}
            </p>
            {renderChangeIndicator(change.assets, change.assetsPercent)}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Liabilities</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currencySymbol}{formatCompact(totals.liabilities)}
            </p>
            {renderChangeIndicator(change.liabilities, change.liabilitiesPercent, true)}
          </div>
        </div>
      </div>

      {/* Chart Type Selector - Added Comparison Tab */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
        <button
          onClick={() => setActiveChart('networth')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 min-w-[70px] ${
            activeChart === 'networth'
              ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Trend
        </button>
        <button
          onClick={() => setActiveChart('comparison')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 min-w-[70px] ${
            activeChart === 'comparison'
              ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Compare
        </button>
        <button
          onClick={() => setActiveChart('assets')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 min-w-[70px] ${
            activeChart === 'assets'
              ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          Assets
        </button>
        <button
          onClick={() => setActiveChart('goals')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 min-w-[70px] ${
            activeChart === 'goals'
              ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Goals
        </button>
      </div>

      {/* Time Frame Selector */}
      {(activeChart === 'networth' || activeChart === 'comparison') && (
        <div className="flex gap-2 justify-center">
          {['3M', '6M', 'YTD', '1Y'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFrame(period)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Net Worth Progression
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--chart-axis)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                    tickFormatter={(value) => `${currencySymbol}${formatCompact(value)}`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px',
                      color: 'var(--tooltip-text)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value)]}
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
                    dataKey="netWorth"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#netWorthGradient)"
                    name="Net Worth"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Net Worth</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* NEW: Assets vs Liabilities Comparison Chart */}
        {activeChart === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Assets vs Liabilities
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                    tickFormatter={(value) => `${currencySymbol}${formatCompact(value)}`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px',
                      color: 'var(--tooltip-text)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value)]}
                    labelStyle={{ color: 'var(--tooltip-text)' }}
                    itemStyle={{ color: 'var(--tooltip-text)' }}
                    cursor={{ fill: 'rgba(100, 100, 100, 0.2)' }}
                  />
                  <Bar dataKey="assets" fill="#10b981" name="Assets" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Liabilities</span>
              </div>
            </div>
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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-green-500" />
              Asset Distribution
            </h3>
            {assetDistribution.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {assetDistribution.map((entry, index) => (
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
                        formatter={(value) => [formatCurrency(value)]}
                        labelStyle={{ color: 'var(--tooltip-text)' }}
                        itemStyle={{ color: 'var(--tooltip-text)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Asset List */}
                <div className="space-y-2 mt-4">
                  {assetDistribution.slice(0, 5).map((asset, index) => {
                    const percentage = (asset.value / totals.assets) * 100;
                    return (
                      <div key={asset.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                            {asset.name}
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
                  {assetDistribution.length > 5 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      +{assetDistribution.length - 5} more assets
                    </p>
                  )}
                </div>
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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-500" />
              Goal Progress
            </h3>
            {goalProgress.length > 0 ? (
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
                    {/* Progress Bar */}
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
              <div className="h-48 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mb-2 opacity-30" />
                <p>No goals set yet</p>
                <p className="text-xs mt-1">Add goals in the Netsheet tab</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month Picker Modal */}
      <AnimatePresence>
        {showMonthPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMonthPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl p-5 z-50 w-[90%] max-w-sm shadow-xl"
            >
              <h3 className="text-lg font-semibold text-center mb-4 text-gray-900 dark:text-gray-100">
                Select Month
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((month, idx) => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(idx);
                      setShowMonthPicker(false);
                    }}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      idx === selectedMonth
                        ? 'bg-blue-600 text-white'
                        : idx === currentMonth && selectedYear === currentYear
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
              {/* Year Navigation */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[60px] text-center">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileAnalyticsView;
