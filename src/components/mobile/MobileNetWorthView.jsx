import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  PieChart as PieChartIcon,
  Calendar
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

// Helper function to get account icon
const getAccountIcon = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('credit') || lowerName.includes('card')) return <CreditCard className="w-4 h-4" />;
  if (lowerName.includes('house') || lowerName.includes('home') || lowerName.includes('property')) return <Home className="w-4 h-4" />;
  if (lowerName.includes('car') || lowerName.includes('auto') || lowerName.includes('vehicle')) return <Car className="w-4 h-4" />;
  if (lowerName.includes('401k') || lowerName.includes('retirement') || lowerName.includes('ira')) return <PiggyBank className="w-4 h-4" />;
  if (lowerName.includes('invest') || lowerName.includes('stock')) return <TrendingUp className="w-4 h-4" />;
  if (lowerName.includes('business')) return <Briefcase className="w-4 h-4" />;
  if (lowerName.includes('save') || lowerName.includes('saving')) return <Wallet className="w-4 h-4" />;
  return <DollarSign className="w-4 h-4" />;
};

/**
 * Mobile-optimized Account Card component
 */
const MobileAccountCard = ({
  account,
  value,
  onEdit,
  onDelete,
  formatCurrency,
  type = 'asset',
  onRequestDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  const borderColor = type === 'asset' ? 'border-l-green-500' : 'border-l-red-500';
  const iconBg = type === 'asset' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600';

  return (
    <motion.div
      layout
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 ${borderColor} overflow-hidden`}
    >
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setShowActions(!showActions)}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${iconBg}`}>
            {getAccountIcon(account.name)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.name}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{type}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold ${type === 'asset' ? 'text-gray-900 dark:text-gray-100' : 'text-red-600'}`}>
            {formatCurrency(value)}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showActions ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expandable Actions */}
      <AnimatePresence>
        {showActions && (
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
                  setShowActions(false);
                  onEdit();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(false);
                  onRequestDelete(account);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
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
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountValue, setNewAccountValue] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState('');
  
  // Edit account modal state
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccountValue, setEditAccountValue] = useState('');
  const [editAccountMonth, setEditAccountMonth] = useState(selectedMonth);
  const [showEditMonthPicker, setShowEditMonthPicker] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, account: null, type: null });

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

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;
    const accountType = activeSection === 'liabilities' ? 'liability' : 'asset';
    const newAccount = await addAccount(newAccountName, accountType);
    
    // If initial value is set, update the snapshot
    if (newAccountValue && newAccount?.id) {
      const value = parseFloat(newAccountValue) || 0;
      if (value > 0) {
        await updateSnapshot(newAccount.id, selectedMonth, value);
      }
    }
    
    setNewAccountName('');
    setNewAccountValue('');
    setShowAddAccount(false);
  };

  const handleAddGoal = async () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    await addGoal(newGoalName, parseFloat(newGoalTarget));
    setNewGoalName('');
    setNewGoalTarget('');
    setShowAddGoal(false);
  };

  // Open edit modal for an account
  const openEditAccount = (account, type) => {
    setEditingAccount({ ...account, type });
    setEditAccountValue(getSnapshotValue(account.id, selectedMonth).toString());
    setEditAccountMonth(selectedMonth);
    setShowEditAccount(true);
  };

  // Save edited account value
  const handleEditAccountSave = async () => {
    if (!editingAccount) return;
    const value = parseFloat(editAccountValue) || 0;
    await updateSnapshot(editingAccount.id, editAccountMonth, value);
    setShowEditAccount(false);
    setEditingAccount(null);
    setEditAccountValue('');
  };

  return (
    <div className="space-y-3 pb-20">
      {/* Net Worth Summary - Analytics Style - Compact */}
      <div className={`rounded-lg p-4 ${totals.netWorth >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-white/80 text-xs font-medium mb-0.5">Net Worth</div>
            <div className="text-white text-2xl font-bold">{formatCurrency(totals.netWorth)}</div>
          </div>
          <div className="p-1.5 bg-white/20 rounded-md">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Change indicator */}
        {chartData.length >= 2 && (
          <div className="flex items-center gap-1 text-white/80 text-xs">
            {chartData[chartData.length - 1].netWorth >= chartData[chartData.length - 2].netWorth ? (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>+{currencySymbol}{formatCompact(Math.abs(chartData[chartData.length - 1].netWorth - chartData[chartData.length - 2].netWorth))} from last month</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 rotate-180" />
                <span>-{currencySymbol}{formatCompact(Math.abs(chartData[chartData.length - 1].netWorth - chartData[chartData.length - 2].netWorth))} from last month</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Assets & Liabilities Cards - Analytics Style */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Assets</span>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {currencySymbol}{formatCompact(totals.assets)}
          </p>
          {chartData.length >= 2 ? (
            (() => {
              const assetChange = chartData[chartData.length - 1].assets - chartData[chartData.length - 2].assets;
              if (assetChange === 0) return <p className="text-[10px] text-gray-500 dark:text-gray-400">— No change</p>;
              return (
                <p className={`text-[10px] ${assetChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {assetChange > 0 ? '↑' : '↓'} {currencySymbol}{formatCompact(Math.abs(assetChange))}
                </p>
              );
            })()
          ) : (
            <p className="text-[10px] text-gray-500 dark:text-gray-400">— No change</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Liabilities</span>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {currencySymbol}{formatCompact(totals.liabilities)}
          </p>
          {chartData.length >= 2 ? (
            (() => {
              const liabilityChange = chartData[chartData.length - 1].liabilities - chartData[chartData.length - 2].liabilities;
              if (liabilityChange === 0) return <p className="text-[10px] text-gray-500 dark:text-gray-400">— No change</p>;
              // For liabilities, decrease is good (green), increase is bad (red)
              return (
                <p className={`text-[10px] ${liabilityChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {liabilityChange > 0 ? '↑' : '↓'} {currencySymbol}{formatCompact(Math.abs(liabilityChange))}
                </p>
              );
            })()
          ) : (
            <p className="text-[10px] text-gray-500 dark:text-gray-400">— No change</p>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        <button
          onClick={() => setActiveSection('assets')}
          className={`flex-1 py-2 rounded-md font-medium transition-all text-xs ${
            activeSection === 'assets'
              ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Assets ({accounts.assets?.length || 0})
        </button>
        <button
          onClick={() => setActiveSection('liabilities')}
          className={`flex-1 py-2 rounded-md font-medium transition-all text-xs ${
            activeSection === 'liabilities'
              ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Debts ({accounts.liabilities?.length || 0})
        </button>
        <button
          onClick={() => setActiveSection('goals')}
          className={`flex-1 py-2 rounded-md font-medium transition-all text-xs ${
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
          className="space-y-2"
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
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 border-l-yellow-500 p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{goal.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${progress >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                          {progress.toFixed(0)}%
                        </span>
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => {
                                setEditingGoalId(goal.id);
                                setEditGoalValue(goal.current_amount?.toString() || '0');
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1.5">
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
                  onEdit={() => openEditAccount(account, activeSection === 'assets' ? 'asset' : 'liability')}
                  onDelete={() => deleteAccount(account.id, activeSection === 'assets' ? 'asset' : 'liability')}
                  onRequestDelete={(acc) => setDeleteConfirm({ show: true, account: acc, type: activeSection === 'assets' ? 'asset' : 'liability' })}
                  formatCurrency={formatCurrency}
                  type={activeSection === 'assets' ? 'asset' : 'liability'}
                />
              ))}

              {/* Add Account Button */}
              <button
                onClick={() => setShowAddAccount(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add {activeSection === 'assets' ? 'Asset' : 'Liability'}
              </button>
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
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
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
            {/* Center Total Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {currencySymbol}{formatCompact(totals.assets)}
                </div>
              </div>
            </div>
          </div>
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

      {/* Add Account Bottom Sheet Modal */}
      <AnimatePresence>
        {showAddAccount && activeSection !== 'goals' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAccount(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[90vh] overflow-hidden"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add {activeSection === 'assets' ? 'Asset' : 'Liability'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddAccount(false);
                    setNewAccountName('');
                    setNewAccountValue('');
                  }}
                  className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)]">
                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {activeSection === 'assets' ? 'Asset' : 'Liability'} Name
                  </label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder={activeSection === 'assets' ? 'e.g., Savings Account, Investment Portfolio' : 'e.g., Credit Card, Car Loan'}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    autoFocus
                  />
                </div>

                {/* Initial Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Value <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                      {currencySymbol}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newAccountValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setNewAccountValue(value);
                      }}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 text-xl font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Add
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(activeSection === 'assets' 
                      ? ['Checking Account', 'Savings Account', '401(k)', 'Roth IRA', 'Brokerage', 'Real Estate', 'Crypto', 'Emergency Fund']
                      : ['Credit Card', 'Mortgage', 'Car Loan', 'Student Loan', 'Personal Loan', 'Medical Debt']
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setNewAccountName(suggestion)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          newAccountName === suggestion
                            ? activeSection === 'assets'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-2 ring-green-500'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-2 ring-red-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with Save button */}
              <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  onClick={handleAddAccount}
                  disabled={!newAccountName.trim()}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-white text-lg
                    transition-all flex items-center justify-center gap-2
                    ${!newAccountName.trim()
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : activeSection === 'assets'
                        ? 'bg-green-500 hover:bg-green-600 active:scale-[0.98]'
                        : 'bg-red-500 hover:bg-red-600 active:scale-[0.98]'
                    }
                  `}
                >
                  <Check className="w-5 h-5" />
                  Add {activeSection === 'assets' ? 'Asset' : 'Liability'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Account Bottom Sheet Modal */}
      <AnimatePresence>
        {showEditAccount && editingAccount && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditAccount(false);
                setEditingAccount(null);
                setEditAccountValue('');
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Compact Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-50"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Header - Compact */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Edit {editingAccount.type === 'asset' ? 'Asset' : 'Liability'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditAccount(false);
                    setEditingAccount(null);
                    setEditAccountValue('');
                  }}
                  className="p-1.5 -mr-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content - Compact */}
              <div className="px-4 py-3 space-y-3">
                {/* Account Name (read-only) - Compact */}
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`p-1.5 rounded-md ${editingAccount.type === 'asset' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {getAccountIcon(editingAccount.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{editingAccount.name}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{editingAccount.type}</div>
                  </div>
                </div>

                {/* Amount Input - Compact */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                      {currencySymbol}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editAccountValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setEditAccountValue(value);
                      }}
                      placeholder="0.00"
                      className={`
                        w-full pl-8 pr-3 py-2.5 
                        text-xl font-semibold text-gray-900 dark:text-gray-100
                        bg-gray-50 dark:bg-gray-800 
                        border border-gray-200 dark:border-gray-700 
                        rounded-lg
                        focus:outline-none focus:border-2 
                        ${editingAccount.type === 'asset' ? 'focus:border-green-500' : 'focus:border-red-500'} 
                        transition-colors
                      `}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Month Selection - Compact */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Month
                  </label>
                  <button
                    onClick={() => setShowEditMonthPicker(!showEditMonthPicker)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{MONTHS[editAccountMonth]} {selectedYear}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showEditMonthPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Month Picker Grid - Compact */}
                  <AnimatePresence>
                    {showEditMonthPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-4 gap-1">
                          {MONTHS.map((m, idx) => (
                            <button
                              key={m}
                              onClick={() => {
                                setEditAccountMonth(idx);
                                setShowEditMonthPicker(false);
                                // Update value to show current value for selected month
                                setEditAccountValue(getSnapshotValue(editingAccount.id, idx).toString());
                              }}
                              className={`
                                py-1.5 rounded-md text-xs font-medium transition-colors
                                ${editAccountMonth === idx
                                  ? editingAccount.type === 'asset' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer with Save button - Compact */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  onClick={handleEditAccountSave}
                  className={`
                    w-full py-2.5 rounded-lg font-semibold text-white text-sm
                    transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]
                    ${editingAccount.type === 'asset'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                    }
                  `}
                >
                  <Check className="w-4 h-4" />
                  Save {editingAccount.type === 'asset' ? 'Asset' : 'Liability'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ show: false, account: null, type: null })}
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
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Delete {deleteConfirm.type === 'asset' ? 'Asset' : 'Liability'}
                  </h3>
                </div>
                <button
                  onClick={() => setDeleteConfirm({ show: false, account: null, type: null })}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Are you sure you want to delete this {deleteConfirm.type}?
                </p>
                {deleteConfirm.account && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    "{deleteConfirm.account.name}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setDeleteConfirm({ show: false, account: null, type: null })}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.account) {
                      deleteAccount(deleteConfirm.account.id, deleteConfirm.type);
                    }
                    setDeleteConfirm({ show: false, account: null, type: null });
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
          if (activeSection === 'goals') {
            setShowAddGoal(true);
          } else {
            setShowAddAccount(true);
          }
        }}
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
