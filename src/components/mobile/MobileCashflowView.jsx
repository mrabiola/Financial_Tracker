import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  BarChart3,
  List,
  Grid3X3,
  Clock,
  Copy,
  PieChart as PieChartIcon
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
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [timeFrame, setTimeFrame] = useState('1M');

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

  // Navigate months
  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-4 pb-20">
      {/* Header - Month Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={() => setShowMonthPicker(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </button>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['1M', 'YTD', '3M', '6M', 'ALL'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeFrame(period)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
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

      {/* Summary Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <ArrowDownCircle className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-xs uppercase tracking-wide opacity-80">Income</div>
          <div className="text-xl font-bold mt-1">{currencySymbol}{formatCompact(totalIncome)}</div>
        </div>

        {/* Expenses Card */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <ArrowUpCircle className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-xs uppercase tracking-wide opacity-80">Expenses</div>
          <div className="text-xl font-bold mt-1">{currencySymbol}{formatCompact(totalExpenses)}</div>
        </div>

        {/* Net Flow Card */}
        <div className={`bg-gradient-to-br ${netFlow >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-4 text-white`}>
          <Activity className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-xs uppercase tracking-wide opacity-80">Net Flow</div>
          <div className="text-xl font-bold mt-1">{currencySymbol}{formatCompact(netFlow)}</div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
          <PiggyBank className="w-5 h-5 mb-2 opacity-80" />
          <div className="text-xs uppercase tracking-wide opacity-80">Savings Rate</div>
          <div className="text-xl font-bold mt-1">{savingsRate.toFixed(0)}%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={copyPreviousMonth}
          className="flex-1 py-3 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Copy className="w-4 h-4" />
          Copy Previous
        </button>
      </div>

      {/* Section Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveSection('expenses')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'expenses'
              ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Expenses
        </button>
        <button
          onClick={() => setActiveSection('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
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
          key={activeSection}
          initial={{ opacity: 0, x: activeSection === 'income' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeSection === 'income' ? -20 : 20 }}
          transition={{ duration: 0.2 }}
          className={viewMode === 'cards' ? 'space-y-3' : 'space-y-2'}
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

            return (
              <MobileCategoryCard
                key={category.name}
                icon={category.icon}
                name={category.name}
                spent={displayAmount}
                budget={0} // No budget tracking yet
                color={activeSection === 'income' ? 'green' : COLORS[index % COLORS.length].includes('ef4444') ? 'red' : 'blue'}
                onClick={() => handleCategoryTap(category, activeSection === 'income' ? 'income' : 'expenses')}
                formatCurrency={(v) => `${currencySymbol}${formatCompact(v)}`}
                showBudget={false}
                type={activeSection}
              />
            );
          })}

          {/* Add Category Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add {activeSection === 'income' ? 'Income Source' : 'Category'}
          </motion.button>
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
          <ResponsiveContainer width="100%" height={200}>
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

      {/* Month Picker Modal */}
      <AnimatePresence>
        {showMonthPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMonthPicker(false)}
              className="fixed inset-0 bg-black/50 z-50"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
