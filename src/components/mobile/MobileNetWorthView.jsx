import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  TrendingUp,
  Wallet,
  Target,
  PiggyBank,
  CreditCard,
  Home,
  Car,
  Briefcase,
  DollarSign,
  ChevronDown,
  Edit2,
  Trash2,
  Check,
  X,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * Mobile-optimized Account Card component
 */
const MobileAccountCard = ({
  account,
  value,
  onChange,
  onDelete,
  formatCurrency,
  type = 'asset'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [showActions, setShowActions] = useState(false);

  const getAccountIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('credit') || lowerName.includes('card')) return <CreditCard className="w-5 h-5" />;
    if (lowerName.includes('house') || lowerName.includes('home') || lowerName.includes('property')) return <Home className="w-5 h-5" />;
    if (lowerName.includes('car') || lowerName.includes('auto') || lowerName.includes('vehicle')) return <Car className="w-5 h-5" />;
    if (lowerName.includes('401k') || lowerName.includes('retirement') || lowerName.includes('ira')) return <PiggyBank className="w-5 h-5" />;
    if (lowerName.includes('invest') || lowerName.includes('stock')) return <TrendingUp className="w-5 h-5" />;
    if (lowerName.includes('business')) return <Briefcase className="w-5 h-5" />;
    if (lowerName.includes('save') || lowerName.includes('saving')) return <Wallet className="w-5 h-5" />;
    return <DollarSign className="w-5 h-5" />;
  };

  const handleSave = () => {
    const numValue = parseFloat(editValue) || 0;
    onChange(numValue);
    setIsEditing(false);
  };

  const borderColor = type === 'asset' ? 'border-l-green-500' : 'border-l-red-500';
  const iconBg = type === 'asset' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600';

  return (
    <motion.div
      layout
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 ${borderColor} overflow-hidden`}
    >
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => !isEditing && setShowActions(!showActions)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            {getAccountIcon(account.name)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{account.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{type}</div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-gray-400">$</span>
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-24 px-2 py-1 text-right text-lg font-semibold border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <button
              onClick={handleSave}
              className="p-1.5 bg-green-500 text-white rounded-lg"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${type === 'asset' ? 'text-gray-900 dark:text-gray-100' : 'text-red-600'}`}>
              {formatCurrency(value)}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showActions ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {/* Expandable Actions */}
      <AnimatePresence>
        {showActions && !isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex divide-x divide-gray-100 dark:divide-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditValue(value.toString());
                  setIsEditing(true);
                  setShowActions(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete ${account.name}?`)) {
                    onDelete();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Months array defined outside component to avoid recreation on each render
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Mobile-optimized Net Worth Tracker View
 */
const MobileNetWorthView = ({
  selectedYear,
  selectedMonth,
  setSelectedMonth,
  setSelectedYear,
  accounts,
  goals,
  getSnapshotValue,
  updateSnapshot,
  addAccount,
  deleteAccount,
  addGoal,
  updateGoalProgress,
  deleteGoal,
  formatCurrency,
  formatCurrencyShort,
  getCurrencySymbol,
  currency,
  copyPreviousMonth
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
  const [activeSection, setActiveSection] = useState('assets'); // 'assets' | 'liabilities' | 'goals'
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState('');

  // Calculate totals
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

  // Prepare chart data (last 6 months)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
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
  }, [accounts, selectedMonth, getSnapshotValue]);

  // Pie chart data for asset distribution
  const assetDistribution = useMemo(() => {
    return (accounts.assets || [])
      .map(asset => ({
        name: asset.name,
        value: getSnapshotValue(asset.id, selectedMonth)
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [accounts.assets, selectedMonth, getSnapshotValue]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

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

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;
    await addAccount(newAccountName, activeSection === 'liabilities' ? 'liability' : 'asset');
    setNewAccountName('');
    setShowAddAccount(false);
  };

  const handleAddGoal = async () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    await addGoal(newGoalName, parseFloat(newGoalTarget));
    setNewGoalName('');
    setNewGoalTarget('');
    setShowAddGoal(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header - Month/Year Selector */}
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
      </div>

      {/* Net Worth Summary */}
      <div className={`rounded-xl p-5 ${totals.netWorth >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
        <div className="text-white/80 text-sm font-medium mb-1">Net Worth</div>
        <div className="text-white text-3xl font-bold mb-4">{formatCurrency(totals.netWorth)}</div>
        
        <div className="flex justify-between text-sm">
          <div>
            <div className="text-white/70">Assets</div>
            <div className="text-white font-semibold">{currencySymbol}{formatCompact(totals.assets)}</div>
          </div>
          <div className="text-right">
            <div className="text-white/70">Liabilities</div>
            <div className="text-white font-semibold">{currencySymbol}{formatCompact(totals.liabilities)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={copyPreviousMonth}
          className="flex-1 py-3 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
        >
          Copy Previous
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveSection('assets')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all text-sm ${
            activeSection === 'assets'
              ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Assets ({accounts.assets?.length || 0})
        </button>
        <button
          onClick={() => setActiveSection('liabilities')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all text-sm ${
            activeSection === 'liabilities'
              ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Debts ({accounts.liabilities?.length || 0})
        </button>
        <button
          onClick={() => setActiveSection('goals')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all text-sm ${
            activeSection === 'goals'
              ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Goals ({goals?.length || 0})
        </button>
      </div>

      {/* Account Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {activeSection === 'goals' ? (
            // Goals Section
            <>
              {(goals || []).map(goal => {
                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                const isEditing = editingGoalId === goal.id;
                
                return (
                  <div
                    key={goal.id}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 border-l-yellow-500 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${progress >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                          {progress.toFixed(0)}%
                        </span>
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => {
                                setEditingGoalId(goal.id);
                                setEditGoalValue(goal.current_amount?.toString() || '0');
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                          <input
                            type="number"
                            value={editGoalValue}
                            onChange={(e) => setEditGoalValue(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
                            placeholder="Current amount"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => {
                            updateGoalProgress(goal.id, parseFloat(editGoalValue) || 0);
                            setEditingGoalId(null);
                            setEditGoalValue('');
                          }}
                          className="p-2 bg-green-500 text-white rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoalId(null);
                            setEditGoalValue('');
                          }}
                          className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{currencySymbol}{formatCompact(goal.current_amount)}</span>
                        <span className="text-gray-500 dark:text-gray-500">Target: {currencySymbol}{formatCompact(goal.target_amount)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Add Goal Button */}
              {showAddGoal ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Goal name"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="number"
                    placeholder="Target amount"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddGoal}
                      className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-medium"
                    >
                      Add Goal
                    </button>
                    <button
                      onClick={() => setShowAddGoal(false)}
                      className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Goal
                </button>
              )}
            </>
          ) : (
            // Assets/Liabilities Section
            <>
              {(activeSection === 'assets' ? accounts.assets : accounts.liabilities || []).map(account => (
                <MobileAccountCard
                  key={account.id}
                  account={account}
                  value={getSnapshotValue(account.id, selectedMonth)}
                  onChange={(value) => updateSnapshot(account.id, selectedMonth, value)}
                  onDelete={() => deleteAccount(account.id, activeSection === 'assets' ? 'asset' : 'liability')}
                  formatCurrency={formatCurrency}
                  type={activeSection === 'assets' ? 'asset' : 'liability'}
                />
              ))}

              {/* Add Account */}
              {showAddAccount ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                  <input
                    type="text"
                    placeholder={`${activeSection === 'assets' ? 'Asset' : 'Liability'} name`}
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full px-4 py-3 mb-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddAccount();
                      if (e.key === 'Escape') setShowAddAccount(false);
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAccount}
                      className={`flex-1 py-3 text-white rounded-xl font-medium ${
                        activeSection === 'assets' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      Add {activeSection === 'assets' ? 'Asset' : 'Liability'}
                    </button>
                    <button
                      onClick={() => setShowAddAccount(false)}
                      className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add {activeSection === 'assets' ? 'Asset' : 'Liability'}
                </button>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Net Worth Trend Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Net Worth Trend
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              fill="url(#netWorthGradient)"
              strokeWidth={2}
              name="Net Worth"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Distribution Pie */}
      {assetDistribution.length > 0 && activeSection === 'assets' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-green-500" />
            Asset Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
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
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {assetDistribution.slice(0, 5).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
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

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddAccount(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 ${
          activeSection === 'assets'
            ? 'bg-green-500 hover:bg-green-600'
            : activeSection === 'liabilities'
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
};

export default MobileNetWorthView;
