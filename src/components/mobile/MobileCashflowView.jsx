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
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, category: null });

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

  // Calculate totals
  const totalIncome = preparedIncomeData.reduce((sum, cat) => sum + cat.amount, 0);
  const totalExpenses = preparedExpenseData.reduce((sum, cat) => sum + cat.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  // Chart data
  const chartData = useMemo(() => {
    return filteredMonthIndices.map(idx => ({
      month: MONTHS[idx],
      income: metrics.monthlyIncome[idx] || 0,
      expenses: metrics.monthlyExpenses[idx] || 0,
      netFlow: (metrics.monthlyIncome[idx] || 0) - (metrics.monthlyExpenses[idx] || 0)
    }));
  }, [metrics, filteredMonthIndices]);

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
  const handleDeleteCategory = (categoryName) => {
    const type = activeSection === 'income' ? 'income' : 'expenses';
    deleteCategory(type, categoryName);
  };

  // Request delete - shows confirmation modal
  const handleRequestDeleteCategory = (category) => {
    setDeleteConfirm({ show: true, category });
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
                onDelete={() => handleDeleteCategory(category.name)}
                onRequestDelete={() => handleRequestDeleteCategory(category)}
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

      {/* Pie Chart for Distribution */}
      {(activeSection === 'expenses' ? preparedExpenseData : preparedIncomeData).filter(c => c.amount > 0).length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChartIcon className={`w-5 h-5 ${activeSection === 'income' ? 'text-green-500' : 'text-red-500'}`} />
            {activeSection === 'income' ? 'Income Distribution' : 'Expense Distribution'}
          </h3>
          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(activeSection === 'expenses' ? preparedExpenseData : preparedIncomeData).filter(c => c.amount > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="name"
                >
                  {(activeSection === 'expenses' ? preparedExpenseData : preparedIncomeData)
                    .filter(c => c.amount > 0)
                    .map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
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
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {currencySymbol}{formatCompact(
                    (activeSection === 'expenses' ? preparedExpenseData : preparedIncomeData)
                      .reduce((sum, c) => sum + c.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {(activeSection === 'expenses' ? preparedExpenseData : preparedIncomeData)
              .filter(c => c.amount > 0)
              .slice(0, 6)
              .map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
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
      <AnimatePresence>
        {deleteConfirm.show && deleteConfirm.category && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ show: false, category: null })}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-xl z-50 max-w-sm mx-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Delete Category
                  </h3>
                </div>
                <button
                  onClick={() => setDeleteConfirm({ show: false, category: null })}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Are you sure you want to delete this category? This will also remove all data for this category.
                </p>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <span className="text-lg">{deleteConfirm.category.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {deleteConfirm.category.name}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setDeleteConfirm({ show: false, category: null })}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.category) {
                      handleDeleteCategory(deleteConfirm.category.name);
                    }
                    setDeleteConfirm({ show: false, category: null });
                  }}
                  className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-l border-gray-200 dark:border-gray-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
