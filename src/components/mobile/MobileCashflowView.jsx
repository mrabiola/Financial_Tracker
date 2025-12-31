import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  BarChart3,
  List,
  Grid3X3,
  Clock,
  PieChart as PieChartIcon,
  X,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MobileCategoryCard from './MobileCategoryCard';
import MobileQuickEntry from './MobileQuickEntry';
import ConfirmModal from '../common/ConfirmModal';

// Months array defined outside component to avoid recreation
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Mobile-optimized Cashflow Section
 * Replaces the desktop Excel-style tables with card-based UI
 */
const MobileCashflowView = ({
  selectedYear,
  selectedMonth,
  setSelectedMonth,
  setSelectedYear,
  cashflowData,
  incomeCategories,
  expenseCategories,
  saveCashflowData,
  copyPreviousMonth,
  addCategory,
  deleteCategory,
  calculateMetrics,
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
  const [activeSection, setActiveSection] = useState('expenses'); // 'income' | 'expenses'
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState('expense');
  const [quickEntryCategory, setQuickEntryCategory] = useState(null);
  const [quickEntryValue, setQuickEntryValue] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'
  const [timeFrame, setTimeFrame] = useState('1M');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('💰');
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, category: null, type: null });
  const closeDeleteConfirm = () => setDeleteConfirm({ show: false, category: null, type: null });
  const handleConfirmDelete = () => {
    if (deleteConfirm.category && deleteConfirm.type) {
      deleteCategory(deleteConfirm.type, deleteConfirm.category.name);
    }
  };

  // Common emoji icons for categories
  const categoryIcons = ['💰', '🏠', '🚗', '🍔', '🛒', '💊', '🎬', '✈️', '📱', '💼', '📚', '🎁', '⚡', '💧', '🏥', '👔', '🎮', '🐕', '💳', '📦'];

  const metrics = calculateMetrics(selectedMonth);

  // Get filtered month indices based on time frame - memoized
  const filteredMonthIndices = useMemo(() => {
    const endMonth = currentMonth;
    let startMonth = 0;

    if (timeFrame === '1M') {
      return [selectedMonth];
    }

    if (selectedYear !== currentYear || timeFrame === 'ALL') {
      return Array.from({ length: 12 }, (_, i) => i);
    }

    switch (timeFrame) {
      case 'YTD':
        return Array.from({ length: endMonth + 1 }, (_, i) => i);
      case '3M':
        startMonth = Math.max(0, endMonth - 2);
        return Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i);
      case '6M':
        startMonth = Math.max(0, endMonth - 5);
        return Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i);
      default:
        return Array.from({ length: 12 }, (_, i) => i);
    }
  }, [timeFrame, selectedMonth, selectedYear, currentYear, currentMonth]);

  // Prepare category data with amounts
  const preparedIncomeData = useMemo(() => {
    return incomeCategories.map(cat => {
      const total = filteredMonthIndices.reduce((sum, monthIndex) => {
        return sum + (cashflowData.income[cat.name]?.[monthIndex] || 0);
      }, 0);
      return { ...cat, amount: total };
    }).filter(cat => cat.amount > 0 || timeFrame === '1M');
  }, [incomeCategories, cashflowData, timeFrame, filteredMonthIndices]);

  const preparedExpenseData = useMemo(() => {
    return expenseCategories.map(cat => {
      const total = filteredMonthIndices.reduce((sum, monthIndex) => {
        return sum + (cashflowData.expenses[cat.name]?.[monthIndex] || 0);
      }, 0);
      return { ...cat, amount: total };
    }).filter(cat => cat.amount > 0 || timeFrame === '1M');
  }, [expenseCategories, cashflowData, timeFrame, filteredMonthIndices]);

  // Group smaller categories into "Other" using a 5% threshold
  const processedIncomeData = useMemo(() => {
    if (!preparedIncomeData.length) return { majorItems: [], minorItems: [], totalValue: 0 };

    const totalValue = preparedIncomeData.reduce((sum, item) => sum + item.amount, 0);
    const threshold = totalValue * 0.05;
    const majorItems = [];
    const minorItems = [];

    preparedIncomeData.forEach((item) => {
      const entry = { name: item.name, value: item.amount, icon: item.icon };
      if (entry.value >= threshold) {
        majorItems.push(entry);
      } else {
        minorItems.push(entry);
      }
    });

    if (minorItems.length > 0) {
      const otherTotal = minorItems.reduce((sum, item) => sum + item.value, 0);
      majorItems.push({
        name: 'Other',
        value: otherTotal,
        icon: '💰',
        isOther: true,
        count: minorItems.length
      });
    }

    return { majorItems, minorItems, totalValue };
  }, [preparedIncomeData]);

  const processedExpenseData = useMemo(() => {
    if (!preparedExpenseData.length) return { majorItems: [], minorItems: [], totalValue: 0 };

    const totalValue = preparedExpenseData.reduce((sum, item) => sum + item.amount, 0);
    const threshold = totalValue * 0.05;
    const majorItems = [];
    const minorItems = [];

    preparedExpenseData.forEach((item) => {
      const entry = { name: item.name, value: item.amount, icon: item.icon };
      if (entry.value >= threshold) {
        majorItems.push(entry);
      } else {
        minorItems.push(entry);
      }
    });

    if (minorItems.length > 0) {
      const otherTotal = minorItems.reduce((sum, item) => sum + item.value, 0);
      majorItems.push({
        name: 'Other',
        value: otherTotal,
        icon: '📦',
        isOther: true,
        count: minorItems.length
      });
    }

    return { majorItems, minorItems, totalValue };
  }, [preparedExpenseData]);

  // Calculate totals
  const totalIncome = preparedIncomeData.reduce((sum, cat) => sum + cat.amount, 0);
  const totalExpenses = preparedExpenseData.reduce((sum, cat) => sum + cat.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  const incomeDistribution = processedIncomeData.majorItems;
  const expenseDistribution = processedExpenseData.majorItems;
  const timeLabel = timeFrame === '1M'
    ? `${MONTHS[selectedMonth]} ${selectedYear}`
    : timeFrame === 'ALL'
      ? `${selectedYear}`
      : timeFrame;

  // Chart data
  const chartData = useMemo(() => {
    return filteredMonthIndices.map(idx => ({
      month: MONTHS[idx],
      income: metrics.monthlyIncome[idx] || 0,
      expenses: metrics.monthlyExpenses[idx] || 0,
      netFlow: (metrics.monthlyIncome[idx] || 0) - (metrics.monthlyExpenses[idx] || 0)
    }));
  }, [metrics, filteredMonthIndices]);

  const trendData = useMemo(() => {
    if (timeFrame === '1M') return [];
    const movingAvgWindow = 3;

    return filteredMonthIndices.map((monthIndex) => {
      const startIdx = Math.max(0, monthIndex - movingAvgWindow + 1);
      const endIdx = monthIndex + 1;
      const avgIncome = metrics.monthlyIncome.slice(startIdx, endIdx)
        .reduce((sum, val) => sum + val, 0) / (endIdx - startIdx);
      const avgExpenses = metrics.monthlyExpenses.slice(startIdx, endIdx)
        .reduce((sum, val) => sum + val, 0) / (endIdx - startIdx);

      return {
        month: MONTHS[monthIndex],
        income: metrics.monthlyIncome[monthIndex] || 0,
        expenses: metrics.monthlyExpenses[monthIndex] || 0,
        movingAvgIncome: monthIndex >= movingAvgWindow - 1 ? avgIncome : null,
        movingAvgExpenses: monthIndex >= movingAvgWindow - 1 ? avgExpenses : null
      };
    });
  }, [timeFrame, filteredMonthIndices, metrics]);

  const topSpendingData = useMemo(() => {
    const data = preparedExpenseData.filter(item => item.amount > 0);
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    return data
      .slice()
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        percentage: total > 0 ? (item.amount / total) * 100 : 0
      }));
  }, [preparedExpenseData]);

  // Handle opening quick entry
  const handleCategoryTap = (category, type) => {
    setQuickEntryType(type);
    setQuickEntryCategory(category.name);
    const currentValue = type === 'income' 
      ? cashflowData.income[category.name]?.[selectedMonth] || 0
      : cashflowData.expenses[category.name]?.[selectedMonth] || 0;
    setQuickEntryValue(currentValue > 0 ? currentValue.toString() : '');
    setShowQuickEntry(true);
  };

  // Handle saving from quick entry
  const handleQuickEntrySave = ({ category, amount, month, type }) => {
    saveCashflowData(category, type === 'income' ? 'income' : 'expenses', month, amount);
  };

  // Handle adding new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const type = activeSection === 'income' ? 'income' : 'expenses';
    addCategory(type, newCategoryName.trim(), newCategoryIcon);
    setNewCategoryName('');
    setNewCategoryIcon('💰');
    setShowAddCategory(false);
  };

  // Handle deleting category (called after confirmation)
  const handleDeleteCategory = (type, categoryName) => {
    deleteCategory(type, categoryName);
  };

  // Request delete - shows confirmation modal
  const handleRequestDeleteCategory = (category, type) => {
    setDeleteConfirm({ show: true, category, type });
  };

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-3 pb-20">
      {/* Time Range Toggle - Replaces Month Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
            {['1M', 'YTD', '3M', '6M', 'ALL'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeFrame(period)}
                className={`px-2 py-1 text-[10px] font-semibold rounded transition-all ${
                  timeFrame === period
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards - 2x2 Grid - Compact */}
      <div className="grid grid-cols-2 gap-2">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
          <ArrowDownCircle className="w-4 h-4 mb-1 opacity-80" />
          <div className="text-[10px] uppercase tracking-wide opacity-80">Income</div>
          <div className="text-base font-bold mt-0.5">{currencySymbol}{formatCompact(totalIncome)}</div>
        </div>

        {/* Expenses Card */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
          <ArrowUpCircle className="w-4 h-4 mb-1 opacity-80" />
          <div className="text-[10px] uppercase tracking-wide opacity-80">Expenses</div>
          <div className="text-base font-bold mt-0.5">{currencySymbol}{formatCompact(totalExpenses)}</div>
        </div>

        {/* Net Flow Card */}
        <div className={`bg-gradient-to-br ${netFlow >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg p-3 text-white`}>
          <Activity className="w-4 h-4 mb-1 opacity-80" />
          <div className="text-[10px] uppercase tracking-wide opacity-80">Net Flow</div>
          <div className="text-base font-bold mt-0.5">{currencySymbol}{formatCompact(netFlow)}</div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-3 text-white">
          <PiggyBank className="w-4 h-4 mb-1 opacity-80" />
          <div className="text-[10px] uppercase tracking-wide opacity-80">Savings Rate</div>
          <div className="text-base font-bold mt-0.5">{savingsRate.toFixed(0)}%</div>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        <button
          onClick={() => setActiveSection('expenses')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
            activeSection === 'expenses'
              ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Expenses
        </button>
        <button
          onClick={() => setActiveSection('income')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
            activeSection === 'income'
              ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Income
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {activeSection === 'income' ? 'Income Sources' : 'Spending Categories'}
        </h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'cards' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
          >
            <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
          >
            <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Category Cards/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSection}-${viewMode}`}
          initial={{ opacity: 0, x: activeSection === 'income' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeSection === 'income' ? -20 : 20 }}
          transition={{ duration: 0.2 }}
          className={viewMode === 'cards' ? 'space-y-3' : 'divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'}
        >
          {(activeSection === 'income' ? incomeCategories : expenseCategories).map((category, index) => {
            const amount = activeSection === 'income'
              ? preparedIncomeData.find(c => c.name === category.name)?.amount || 0
              : preparedExpenseData.find(c => c.name === category.name)?.amount || 0;

            // For 1M view, show current month value
            const displayAmount = timeFrame === '1M'
              ? (activeSection === 'income'
                  ? cashflowData.income[category.name]?.[selectedMonth] || 0
                  : cashflowData.expenses[category.name]?.[selectedMonth] || 0)
              : amount;

            // List View - Compact row design
            if (viewMode === 'list') {
              return (
                <div
                  key={category.name}
                  onClick={() => handleCategoryTap(category, activeSection === 'income' ? 'income' : 'expenses')}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    activeSection === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {currencySymbol}{formatCompact(displayAmount)}
                  </span>
                </div>
              );
            }

            // Card View - Full card design
            return (
              <MobileCategoryCard
                key={category.name}
                icon={category.icon}
                name={category.name}
                spent={displayAmount}
                budget={0} // No budget tracking yet
                color={activeSection === 'income' ? 'green' : COLORS[index % COLORS.length].includes('ef4444') ? 'red' : 'blue'}
                onClick={() => handleCategoryTap(category, activeSection === 'income' ? 'income' : 'expenses')}
                onDelete={() => handleDeleteCategory(activeSection === 'income' ? 'income' : 'expenses', category.name)}
                onRequestDelete={() => handleRequestDeleteCategory(category, activeSection === 'income' ? 'income' : 'expenses')}
                formatCurrency={(v) => `${currencySymbol}${formatCompact(v)}`}
                showBudget={false}
                type={activeSection}
              />
            );
          })}

          {/* Add Category Form/Button */}
          {showAddCategory ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Add {activeSection === 'income' ? 'Income Source' : 'Expense Category'}
                </h4>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Icon Selection */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Select Icon</label>
                <div className="flex flex-wrap gap-2">
                  {categoryIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewCategoryIcon(icon)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        newCategoryIcon === icon
                          ? activeSection === 'income'
                            ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                            : 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Name Input */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={activeSection === 'income' ? 'e.g., Freelance Income' : 'e.g., Subscriptions'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                    if (e.key === 'Escape') setShowAddCategory(false);
                  }}
                />
              </div>

              {/* Preview */}
              {newCategoryName && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-2xl">{newCategoryIcon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{newCategoryName}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className={`flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                    !newCategoryName.trim()
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : activeSection === 'income'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Add Category
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                    setNewCategoryIcon('💰');
                  }}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddCategory(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add {activeSection === 'income' ? 'Income Source' : 'Category'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Simple Chart (Simplified for mobile) */}
      {timeFrame !== '1M' && chartData.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Cash Flow Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} tickFormatter={(v) => `${currencySymbol}${formatCompact(v)}`} width={55} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'var(--tooltip-text)' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                cursor={{ fill: 'rgba(100, 100, 100, 0.2)' }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} name="Expenses" />
              <Line type="monotone" dataKey="netFlow" stroke="#3b82f6" strokeWidth={2} dot={false} name="Net Flow" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Spending Categories */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          Top Spending Categories
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
          {timeLabel}
        </p>
        {topSpendingData.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
            No expenses recorded for this period.
          </div>
        ) : (
          <div className="space-y-3">
            {topSpendingData.slice(0, 6).map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon || '📦'}</span>
                    <span className="text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {currencySymbol}{formatCompact(item.amount)}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
            {topSpendingData.length > 6 && (
              <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                +{topSpendingData.length - 6} more categories
              </div>
            )}
          </div>
        )}
      </div>

      {/* Income vs Expense Trends */}
      {timeFrame !== '1M' && trendData.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Income vs Expense Trends
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} tickFormatter={(v) => `${currencySymbol}${formatCompact(v)}`} width={55} />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'var(--tooltip-text)' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="movingAvgIncome"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                name="Avg Income"
              />
              <Line
                type="monotone"
                dataKey="movingAvgExpenses"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                name="Avg Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              Income
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Expenses
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-600" />
              Avg Income
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-red-600" />
              Avg Expenses
            </div>
          </div>
        </div>
      )}

      {/* Pie Chart for Distribution */}
      {(activeSection === 'expenses' ? expenseDistribution : incomeDistribution).length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChartIcon className={`w-5 h-5 ${activeSection === 'income' ? 'text-green-500' : 'text-red-500'}`} />
            {activeSection === 'income' ? 'Income Distribution' : 'Expense Distribution'}
          </h3>
          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeSection === 'expenses' ? expenseDistribution : incomeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {(activeSection === 'expenses' ? expenseDistribution : incomeDistribution)
                    .map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    if (props.payload?.isOther) {
                      const suffix = activeSection === 'income' ? 'sources' : 'categories';
                      return [formatCurrency(value), `${name} (${props.payload.count} ${suffix})`];
                    }
                    return [formatCurrency(value), name];
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-text)',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: 'var(--tooltip-text)' }}
                  itemStyle={{ color: 'var(--tooltip-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {currencySymbol}{formatCompact(
                    activeSection === 'expenses'
                      ? processedExpenseData.totalValue
                      : processedIncomeData.totalValue
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {(activeSection === 'expenses' ? expenseDistribution : incomeDistribution)
              .slice(0, 6)
              .map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {cat.isOther ? `${cat.name} (${cat.count})` : cat.name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Entry Modal */}
      <MobileQuickEntry
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        onSave={handleQuickEntrySave}
        categories={quickEntryType === 'income' ? incomeCategories : expenseCategories}
        selectedCategory={quickEntryCategory}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        months={MONTHS}
        type={quickEntryType}
        initialValue={quickEntryValue}
        formatCurrency={formatCurrency}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show && Boolean(deleteConfirm.category)}
        onClose={closeDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete category"
        message="This will remove all data for this category."
        itemName={deleteConfirm.category?.name || ''}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setQuickEntryType(activeSection === 'income' ? 'income' : 'expense');
          setQuickEntryCategory(null);
          setQuickEntryValue('');
          setShowQuickEntry(true);
        }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 ${
          activeSection === 'income' 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
};

export default MobileCashflowView;
