import React, { useState, useRef, useEffect } from 'react';
import { Copy, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle, CheckCircle, Edit, BarChart3, LineChart, ChevronDown, Eraser, X } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, PieChart, Pie, Cell, Bar, LineChart as RechartsLineChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const CashflowSection = ({
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
  formatCurrencyShort
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showMonthPopup, setShowMonthPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [previewIcon, setPreviewIcon] = useState('');
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInsights] = useState(true); // eslint-disable-line no-unused-vars
  const [openDeleteDropdown, setOpenDeleteDropdown] = useState(null);
  const inputRef = useRef(null);
  const monthButtonRef = useRef(null);

  const metrics = calculateMetrics(selectedMonth);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Close dropdowns when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMonthPopup && !event.target.closest('[data-month-picker]')) {
        setShowMonthPopup(false);
      }
      if (openDeleteDropdown && !event.target.closest('[data-delete-dropdown]')) {
        setOpenDeleteDropdown(null);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (showMonthPopup) setShowMonthPopup(false);
        if (openDeleteDropdown) setOpenDeleteDropdown(null);
        if (editingCell) handleCancelEdit();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMonthPopup, openDeleteDropdown, editingCell]);

  // Handle cell click to edit
  const handleCellClick = (category, type, monthIndex) => {
    const value = type === 'income'
      ? cashflowData.income[category]?.[monthIndex] || 0
      : cashflowData.expenses[category]?.[monthIndex] || 0;

    setEditingCell({ category, type, monthIndex });
    setTempValue(value.toString());
  };

  // Save cell value
  const handleSaveCell = () => {
    if (editingCell) {
      saveCashflowData(editingCell.category, editingCell.type, editingCell.monthIndex, tempValue);
      setEditingCell(null);
      setTempValue('');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCell(null);
    setTempValue('');
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveCell();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Add new category with auto-selected icon
  const handleAddCategory = (type) => {
    if (newCategoryName.trim()) {
      const autoIcon = selectIconForCategory(newCategoryName);
      const success = addCategory(type, newCategoryName, autoIcon);
      if (success) {
        setNewCategoryName('');
        setPreviewIcon('');
        if (type === 'income') {
          setShowAddIncome(false);
        } else {
          setShowAddExpense(false);
        }
      }
    }
  };

  // Handle category name input change with live icon preview
  const handleCategoryNameChange = (value) => {
    setNewCategoryName(value);
    if (value.trim()) {
      setPreviewIcon(selectIconForCategory(value));
    } else {
      setPreviewIcon('');
    }
  };

  // Clear category data (set all months to 0)
  const handleClearCategoryData = (type, categoryName) => {
    // Clear all monthly data for this category
    months.forEach((_, monthIndex) => {
      saveCashflowData(categoryName, type, monthIndex, 0);
    });
    setOpenDeleteDropdown(null);
  };

  // Delete entire category row
  const handleDeleteCategoryRow = (type, categoryName) => {
    deleteCategory(type, categoryName);
    setOpenDeleteDropdown(null);
  };

  // Auto-select icon based on category name
  const selectIconForCategory = (categoryName) => {
    const name = categoryName.toLowerCase();

    // Income icons
    if (name.includes('salary') || name.includes('wage') || name.includes('job')) return '💼';
    if (name.includes('freelance') || name.includes('contract') || name.includes('gig')) return '💻';
    if (name.includes('investment') || name.includes('dividend') || name.includes('stock')) return '📈';
    if (name.includes('rental') || name.includes('rent')) return '🏠';
    if (name.includes('business') || name.includes('profit')) return '🏢';
    if (name.includes('bonus') || name.includes('commission')) return '🎯';
    if (name.includes('gift') || name.includes('lottery')) return '🎁';
    if (name.includes('side') || name.includes('hustle')) return '⚡';

    // Expense icons
    if (name.includes('housing') || name.includes('mortgage') || name.includes('rent')) return '🏠';
    if (name.includes('transport') || name.includes('car') || name.includes('gas') || name.includes('fuel')) return '🚗';
    if (name.includes('food') || name.includes('grocery') || name.includes('dining')) return '🍔';
    if (name.includes('utilities') || name.includes('electric') || name.includes('water') || name.includes('internet')) return '⚡';
    if (name.includes('entertainment') || name.includes('movie') || name.includes('game')) return '🎮';
    if (name.includes('healthcare') || name.includes('medical') || name.includes('doctor')) return '🏥';
    if (name.includes('shopping') || name.includes('clothes') || name.includes('retail')) return '🛒';
    if (name.includes('insurance') || name.includes('coverage')) return '🛡️';
    if (name.includes('education') || name.includes('school') || name.includes('course')) return '📚';
    if (name.includes('travel') || name.includes('vacation') || name.includes('trip')) return '✈️';
    if (name.includes('phone') || name.includes('mobile') || name.includes('telecom')) return '📱';
    if (name.includes('subscription') || name.includes('streaming') || name.includes('service')) return '📺';
    if (name.includes('fitness') || name.includes('gym') || name.includes('sport')) return '💪';
    if (name.includes('beauty') || name.includes('cosmetic') || name.includes('salon')) return '💄';
    if (name.includes('pet') || name.includes('animal')) return '🐕';
    if (name.includes('charity') || name.includes('donation')) return '❤️';
    if (name.includes('tax') || name.includes('fee')) return '📊';

    // Default icons
    return name.includes('income') || name.includes('earn') ? '💰' : '📦';
  };

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevMonthMetrics = calculateMetrics(prevMonth);

    // Check spending trends
    if (metrics.monthExpenses < prevMonthMetrics.monthExpenses) {
      const reduction = ((prevMonthMetrics.monthExpenses - metrics.monthExpenses) / prevMonthMetrics.monthExpenses * 100).toFixed(0);
      insights.push({
        type: 'positive',
        text: `You spent ${reduction}% less than last month 🎉`,
        icon: <TrendingDown className="w-4 h-4 text-green-600" />
      });
    }

    // Check savings rate
    if (metrics.monthSavingsRate > 20) {
      insights.push({
        type: 'positive',
        text: `Great job! ${metrics.monthSavingsRate.toFixed(0)}% savings rate this month`,
        icon: <CheckCircle className="w-4 h-4 text-green-600" />
      });
    } else if (metrics.monthSavingsRate < 0) {
      insights.push({
        type: 'warning',
        text: `Overspent this month`,
        icon: <AlertCircle className="w-4 h-4 text-orange-600" />
      });
    }

    // Check for zero income or expenses
    if (metrics.monthIncome === 0 && metrics.monthExpenses === 0) {
      insights.push({
        type: 'info',
        text: `No data entered for ${months[selectedMonth]} ${selectedYear}`,
        icon: <Edit className="w-4 h-4 text-blue-600" />
      });
    }

    return insights.slice(0, 3);
  };

  // Prepare waterfall chart data (12 months)
  const prepareWaterfallData = () => {
    return months.map((month, index) => ({
      month,
      income: metrics.monthlyIncome[index] || 0,
      expenses: metrics.monthlyExpenses[index] || 0,
      netFlow: metrics.monthlyNetCashflow[index] || 0
    }));
  };


  // Prepare trend data with moving averages
  const prepareTrendData = () => {
    const movingAvgWindow = 3;

    return months.map((month, index) => {
      // Calculate 3-month moving averages
      const startIdx = Math.max(0, index - movingAvgWindow + 1);
      const endIdx = index + 1;
      const avgIncome = metrics.monthlyIncome.slice(startIdx, endIdx).reduce((sum, val) => sum + val, 0) / (endIdx - startIdx);
      const avgExpenses = metrics.monthlyExpenses.slice(startIdx, endIdx).reduce((sum, val) => sum + val, 0) / (endIdx - startIdx);

      return {
        month,
        income: metrics.monthlyIncome[index],
        expenses: metrics.monthlyExpenses[index],
        movingAvgIncome: index >= movingAvgWindow - 1 ? avgIncome : null,
        movingAvgExpenses: index >= movingAvgWindow - 1 ? avgExpenses : null,
        monthIndex: index
      };
    });
  };

  // Prepare category data for selected month
  const prepareCategoryData = (type) => {
    const categories = type === 'income' ? incomeCategories : expenseCategories;
    return categories.map(cat => {
      const monthValue = type === 'income'
        ? cashflowData.income[cat.name]?.[selectedMonth] || 0
        : cashflowData.expenses[cat.name]?.[selectedMonth] || 0;

      return {
        name: cat.name,
        value: monthValue,
        icon: cat.icon
      };
    }).filter(item => item.value > 0);
  };

  const insights = generateInsights();
  const incomeData = prepareCategoryData('income');
  const expenseData = prepareCategoryData('expenses');

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Month Selector and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {/* Month Selector */}
            <div className="relative" data-month-picker>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                    if (newMonth === 11 && selectedMonth === 0) {
                      setSelectedYear(newYear);
                    }
                    setSelectedMonth(newMonth);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  ref={monthButtonRef}
                  onClick={() => setShowMonthPopup(!showMonthPopup)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer min-w-[120px]"
                >
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">{months[selectedMonth]} {selectedYear}</span>
                </button>
                <button
                  onClick={() => {
                    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                    if (newMonth === 0 && selectedMonth === 11) {
                      setSelectedYear(newYear);
                    }
                    setSelectedMonth(newMonth);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Month Selection Popup */}
              {showMonthPopup && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 grid grid-cols-3 gap-2 w-64">
                  {months.map((month, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMonth(idx);
                        setShowMonthPopup(false);
                      }}
                      className={`px-3 py-2 text-sm rounded-lg transition-all ${
                        idx === selectedMonth
                          ? 'bg-blue-600 text-white font-semibold'
                          : idx === currentMonth && selectedYear === currentYear
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyPreviousMonth(selectedMonth)}
              disabled={selectedMonth === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Previous Month
            </button>
          </div>
        </div>

        {/* Auto-insights */}
        {showInsights && insights.length > 0 && (
          <div className="flex gap-3 flex-wrap mt-4">
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                    insight.type === 'positive'
                      ? 'bg-green-50 text-green-800'
                      : insight.type === 'warning'
                      ? 'bg-orange-50 text-orange-800'
                      : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  {insight.icon}
                  <span>{insight.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Excel-Style Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Income Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Income
            </h3>
            <button
              onClick={() => setShowAddIncome(!showAddIncome)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Add Category Form */}
          {showAddIncome && (
            <div className="p-4 border-b border-gray-200 bg-green-25">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                  <span className="text-2xl">{previewIcon || '💰'}</span>
                </div>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="Enter category name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory('income');
                    if (e.key === 'Escape') {
                      setShowAddIncome(false);
                      setNewCategoryName('');
                      setPreviewIcon('');
                    }
                  }}
                />
                <button
                  onClick={() => handleAddCategory('income')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddIncome(false);
                    setNewCategoryName('');
                    setPreviewIcon('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Category
                  </th>
                  {months.map((month, idx) => (
                    <th key={idx} className={`px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${idx === selectedMonth ? 'bg-blue-50' : ''}`}>
                      {month}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incomeCategories.map((category) => {
                  const calculateCategoryTotal = (categoryName) => {
                    const categoryData = cashflowData.income[categoryName] || [];
                    return categoryData.reduce((sum, val) => sum + (val || 0), 0);
                  };

                  return (
                    <tr
                      key={category.name}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          {category.name}
                        </div>
                      </td>
                      {months.map((_, monthIndex) => {
                        const isEditing = editingCell?.category === category.name &&
                                         editingCell?.type === 'income' &&
                                         editingCell?.monthIndex === monthIndex;
                        const value = cashflowData.income[category.name]?.[monthIndex] || 0;

                        return (
                          <td
                            key={monthIndex}
                            className={`px-3 py-3 text-sm text-center cursor-pointer hover:bg-green-50 transition-colors ${monthIndex === selectedMonth ? 'bg-blue-50' : ''}`}
                            onClick={() => !isEditing && handleCellClick(category.name, 'income', monthIndex)}
                          >
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={handleSaveCell}
                                onKeyDown={handleKeyDown}
                                className="w-20 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <motion.span
                                initial={{ scale: 1 }}
                                className={value > 0 ? 'font-medium text-gray-900' : 'text-gray-400'}
                              >
                                {value > 0 ? formatCurrencyShort(value) : '-'}
                              </motion.span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-sm text-center font-bold text-green-600 bg-gray-50">
                        {formatCurrencyShort(calculateCategoryTotal(category.name))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative" data-delete-dropdown>
                          <button
                            onClick={() => setOpenDeleteDropdown(openDeleteDropdown === `income-${category.name}` ? null : `income-${category.name}`)}
                            className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openDeleteDropdown === `income-${category.name}` && (
                            <div className="absolute right-0 top-8 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-1 z-50 min-w-[160px]">
                              <button
                                onClick={() => handleClearCategoryData('income', category.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Eraser className="w-4 h-4 text-blue-600" />
                                Clear Data
                              </button>
                              <button
                                onClick={() => handleDeleteCategoryRow('income', category.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Delete Row
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="bg-green-50 font-bold">
                  <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-green-50">
                    Total Income
                  </td>
                  {months.map((_, monthIndex) => (
                    <td key={monthIndex} className="px-3 py-3 text-sm text-center text-green-600">
                      {formatCurrencyShort(metrics.monthlyIncome[monthIndex])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-center text-green-700 bg-green-100">
                    {formatCurrencyShort(metrics.totalIncome)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Expenses
            </h3>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Add Category Form */}
          {showAddExpense && (
            <div className="p-4 border-b border-gray-200 bg-red-25">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                  <span className="text-2xl">{previewIcon || '📦'}</span>
                </div>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="Enter category name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory('expenses');
                    if (e.key === 'Escape') {
                      setShowAddExpense(false);
                      setNewCategoryName('');
                      setPreviewIcon('');
                    }
                  }}
                />
                <button
                  onClick={() => handleAddCategory('expenses')}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setNewCategoryName('');
                    setPreviewIcon('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Category
                  </th>
                  {months.map((month, idx) => (
                    <th key={idx} className={`px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${idx === selectedMonth ? 'bg-blue-50' : ''}`}>
                      {month}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenseCategories.map((category) => {
                  const calculateCategoryTotal = (categoryName) => {
                    const categoryData = cashflowData.expenses[categoryName] || [];
                    return categoryData.reduce((sum, val) => sum + (val || 0), 0);
                  };

                  return (
                    <tr
                      key={category.name}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          {category.name}
                        </div>
                      </td>
                      {months.map((_, monthIndex) => {
                        const isEditing = editingCell?.category === category.name &&
                                         editingCell?.type === 'expenses' &&
                                         editingCell?.monthIndex === monthIndex;
                        const value = cashflowData.expenses[category.name]?.[monthIndex] || 0;

                        return (
                          <td
                            key={monthIndex}
                            className={`px-3 py-3 text-sm text-center cursor-pointer hover:bg-red-50 transition-colors ${monthIndex === selectedMonth ? 'bg-blue-50' : ''}`}
                            onClick={() => !isEditing && handleCellClick(category.name, 'expenses', monthIndex)}
                          >
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={handleSaveCell}
                                onKeyDown={handleKeyDown}
                                className="w-20 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <motion.span
                                initial={{ scale: 1 }}
                                className={value > 0 ? 'font-medium text-gray-900' : 'text-gray-400'}
                              >
                                {value > 0 ? formatCurrencyShort(value) : '-'}
                              </motion.span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-sm text-center font-bold text-red-600 bg-gray-50">
                        {formatCurrencyShort(calculateCategoryTotal(category.name))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative" data-delete-dropdown>
                          <button
                            onClick={() => setOpenDeleteDropdown(openDeleteDropdown === `expenses-${category.name}` ? null : `expenses-${category.name}`)}
                            className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openDeleteDropdown === `expenses-${category.name}` && (
                            <div className="absolute right-0 top-8 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-1 z-50 min-w-[160px]">
                              <button
                                onClick={() => handleClearCategoryData('expenses', category.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Eraser className="w-4 h-4 text-blue-600" />
                                Clear Data
                              </button>
                              <button
                                onClick={() => handleDeleteCategoryRow('expenses', category.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Delete Row
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="bg-red-50 font-bold">
                  <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-red-50">
                    Total Expenses
                  </td>
                  {months.map((_, monthIndex) => (
                    <td key={monthIndex} className="px-3 py-3 text-sm text-center text-red-600">
                      {formatCurrencyShort(metrics.monthlyExpenses[monthIndex])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-center text-red-700 bg-red-100">
                    {formatCurrencyShort(metrics.totalExpenses)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Primary Waterfall Chart - Fixed Color Coding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Cash Flow Overview - {selectedYear}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={prepareWaterfallData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
              <Tooltip
                formatter={(value, name) => [formatCurrency(Math.abs(value)), name]}
                labelFormatter={(label) => `${label} ${selectedYear}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#ef4444"
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="netFlow"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Net Flow"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isSelected = payload && payload.month === months[selectedMonth];
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 8 : 4}
                      fill={isSelected ? '#1d4ed8' : '#3b82f6'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Spending Categories - Dynamic Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Top Spending Categories - {months[selectedMonth]} {selectedYear}
          </h3>

          {(() => {
            // Get spending data for selected month from actual cashflow data
            const getTopSpending = () => {
              if (!cashflowData.expenses) return [];

              // Extract data for the selected month
              const monthlyData = Object.entries(cashflowData.expenses)
                .map(([category, monthlyValues]) => ({
                  category,
                  amount: Array.isArray(monthlyValues) ? (monthlyValues[selectedMonth] || 0) : 0,
                  icon: expenseCategories.find(cat => cat.name === category)?.icon || '📦'
                }))
                .filter(item => item.amount > 0) // Only show categories with actual spending
                .sort((a, b) => b.amount - a.amount); // Sort by amount descending

              // Calculate percentages based on actual total
              const totalSpending = monthlyData.reduce((sum, item) => sum + item.amount, 0);

              return monthlyData.map(item => ({
                ...item,
                percentage: totalSpending > 0 ? ((item.amount / totalSpending) * 100).toFixed(1) : 0
              }));
            };

            const topSpendingData = getTopSpending();

            if (topSpendingData.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-base font-medium">No expenses recorded</p>
                  <p className="text-sm">for {months[selectedMonth]} {selectedYear}</p>
                </div>
              );
            }

            const totalSpending = topSpendingData.reduce((sum, item) => sum + item.amount, 0);

            return (
              <div className="space-y-4">
                {topSpendingData.slice(0, 8).map((item, idx) => (
                  <div key={item.category} className="group">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium text-gray-700">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-semibold">{formatCurrency(item.amount)}</span>
                        <span className="text-xs text-gray-500 min-w-[40px] text-right">({item.percentage}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-6 rounded-full flex items-center justify-end pr-3 relative"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      >
                        {parseFloat(item.percentage) > 15 && (
                          <span className="text-xs text-white font-medium">
                            {item.percentage}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                ))}

                {/* Dynamic total from actual data */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total {months[selectedMonth]} Spending:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalSpending)}
                    </span>
                  </div>

                  {topSpendingData.length > 8 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Showing top 8 of {topSpendingData.length} categories
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Income vs Expense Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            Income vs Expense Trends - {selectedYear}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={prepareTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                name="Monthly Income"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                name="Monthly Expenses"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="movingAvgIncome"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="8 8"
                name="3-Month Avg Income"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="movingAvgExpenses"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="8 8"
                name="3-Month Avg Expenses"
                dot={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Breakdown Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income Breakdown */}
          {incomeData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Income Sources - {months[selectedMonth]} {selectedYear}
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`income-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Monthly Expense Breakdown */}
          {expenseData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                Expense Categories - {months[selectedMonth]} {selectedYear}
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`expense-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CashflowSection;