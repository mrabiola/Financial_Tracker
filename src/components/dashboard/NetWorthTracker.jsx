import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, Check, ChevronLeft, ChevronRight, ChevronDown, Copy, Download, Upload, TrendingUp, PieChart, BarChart3, LineChart, Target, Wallet, CreditCard, DollarSign, TrendingDown, PiggyBank, Landmark, Home, Car, School, Heart, Briefcase, Coins, AlertCircle, Brain, FileSpreadsheet } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useFinancialData } from '../../hooks/useFinancialData';
import { useCurrency } from '../../contexts/CurrencyContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AdvancedImportModal from './AdvancedImportModal';
import SimpleImportModal from './SimpleImportModal';

const NetWorthTracker = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Use currency context for formatting
  const { formatCurrency, formatCurrencyShort } = useCurrency();

  // Use Supabase data hook
  const {
    loading: dataLoading,
    error: dataError,
    accounts,
    goals,
    addAccount: addAccountToDb,
    deleteAccount: deleteAccountFromDb,
    updateSnapshot,
    addGoal: addGoalToDb,
    updateGoalProgress,
    deleteGoal: deleteGoalFromDb,
    getSnapshotValue,
    reload
  } = useFinancialData(selectedYear);
  const [activeTab, setActiveTab] = useState('data');
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('asset');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showSimpleImportModal, setShowSimpleImportModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ alignRight: false, alignTop: false });
  const importButtonRef = useRef(null);

  // Close import options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showImportOptions && !event.target.closest('[data-import-dropdown]')) {
        setShowImportOptions(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showImportOptions) {
        setShowImportOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showImportOptions]);

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = () => {
    if (!importButtonRef.current) return;
    
    const buttonRect = importButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = viewportWidth >= 640 ? 256 : 224; // sm:w-64 (256px) or w-56 (224px)
    const dropdownHeight = 140; // Approximate height for 2 items
    const padding = 16; // Padding from viewport edge
    
    // Check if dropdown would extend beyond right edge of viewport
    // Also consider the case where the button itself is close to the right edge
    const spaceOnRight = viewportWidth - buttonRect.left;
    const spaceOnLeft = buttonRect.right;
    const alignRight = spaceOnRight < (dropdownWidth + padding) && spaceOnLeft > (dropdownWidth + padding);
    
    // Check if dropdown would extend beyond bottom edge of viewport
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const alignTop = spaceBelow < (dropdownHeight + padding) && spaceAbove > (dropdownHeight + padding);
    
    setDropdownPosition({ alignRight, alignTop });
  };

  // Handle dropdown toggle with position calculation
  const handleImportOptionsToggle = () => {
    if (!showImportOptions) {
      calculateDropdownPosition();
    }
    setShowImportOptions(!showImportOptions);
  };

  // Recalculate dropdown position on window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      if (showImportOptions) {
        calculateDropdownPosition();
      }
    };
    
    const handleScroll = () => {
      if (showImportOptions) {
        calculateDropdownPosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showImportOptions]);

  // Add new account
  const addAccount = async () => {
    if (!newAccountName) return;
    
    await addAccountToDb(newAccountName, newAccountType);
    setNewAccountName('');
    setShowNewAccount(false);
  };

  // Add new goal
  const addGoal = async () => {
    if (!newGoalName || !newGoalTarget) return;
    
    await addGoalToDb(newGoalName, newGoalTarget);
    setNewGoalName('');
    setNewGoalTarget('');
    setShowNewGoal(false);
  };

  // Delete goal
  const deleteGoal = async (goalId) => {
    await deleteGoalFromDb(goalId);
  };

  // Delete account
  const deleteAccount = async (accountId, type) => {
    await deleteAccountFromDb(accountId, type);
  };

  // Get value for a specific account and month
  const getValue = (accountId, monthIndex) => {
    return getSnapshotValue(accountId, monthIndex);
  };

  // Set value for a specific account and month
  const setValue = async (accountId, monthIndex, value) => {
    await updateSnapshot(accountId, monthIndex, value);
  };


  // Copy previous month's values
  const copyPreviousMonth = async () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    
    const allAccounts = [
      ...(accounts.assets || []),
      ...(accounts.liabilities || [])
    ];

    for (const account of allAccounts) {
      const prevValue = getSnapshotValue(account.id, prevMonth);
      await setValue(account.id, selectedMonth, prevValue);
    }
  };

  // Calculate totals for a specific month
  const calculateTotalsForMonth = (monthIndex) => {
    let assetTotal = 0;
    let liabilityTotal = 0;

    (accounts.assets || []).forEach(asset => {
      assetTotal += getSnapshotValue(asset.id, monthIndex);
    });

    (accounts.liabilities || []).forEach(liability => {
      liabilityTotal += getSnapshotValue(liability.id, monthIndex);
    });

    return {
      assets: assetTotal,
      liabilities: liabilityTotal,
      netWorth: assetTotal - liabilityTotal
    };
  };

  const totals = calculateTotalsForMonth(selectedMonth);

  // Get icon for account based on name
  const getAccountIcon = (accountName) => {
    const name = accountName.toLowerCase();
    
    // Check for credit/card FIRST
    if (name.includes('credit') || /\bcard\b/.test(name)) {
      return { icon: <CreditCard className="w-4 h-4" />, tip: 'Credit Card' };
    }
    
    // Check for "car" as a complete word only (not part of other words)
    if (/\bcar\b/.test(name) || name.includes('vehicle') || name.includes('auto')) {
      return { icon: <Car className="w-4 h-4" />, tip: 'Vehicle' };
    }
    
    // Rest of the checks remain the same
    if (name.includes('house') || name.includes('home') || name.includes('property')) {
      return { icon: <Home className="w-4 h-4" />, tip: 'Property' };
    }
    if (name.includes('401k') || name.includes('retirement') || name.includes('ira')) {
      return { icon: <PiggyBank className="w-4 h-4" />, tip: 'Retirement' };
    }
    if (name.includes('save') || name.includes('saving')) {
      return { icon: <Wallet className="w-4 h-4" />, tip: 'Savings' };
    }
    if (name.includes('invest') || name.includes('stock') || name.includes('robin')) {
      return { icon: <TrendingUp className="w-4 h-4" />, tip: 'Investment' };
    }
    if (name.includes('crypto') || name.includes('bitcoin')) {
      return { icon: <Coins className="w-4 h-4" />, tip: 'Cryptocurrency' };
    }
    if (name.includes('loan') || name.includes('mortgage')) {
      return { icon: <Landmark className="w-4 h-4" />, tip: 'Loan' };
    }
    if (name.includes('student') || name.includes('education')) {
      return { icon: <School className="w-4 h-4" />, tip: 'Education' };
    }
    if (name.includes('emergency')) {
      return { icon: <Heart className="w-4 h-4" />, tip: 'Emergency' };
    }
    if (name.includes('business')) {
      return { icon: <Briefcase className="w-4 h-4" />, tip: 'Business' };
    }
    
    return { icon: <DollarSign className="w-4 h-4" />, tip: 'General' };
  };

  // Format currency
  // Currency formatting is now handled by the useCurrency context

  // Handle cell editing
  const startEdit = (accountId, monthIndex) => {
    setEditingCell(`${accountId}_${monthIndex}`);
    setTempValue(getValue(accountId, monthIndex).toString());
  };

  const saveEdit = async () => {
    if (editingCell) {
      const [accountId, monthIndex] = editingCell.split('_');
      await setValue(accountId, parseInt(monthIndex), tempValue);
      setEditingCell(null);
      setTempValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempValue('');
  };

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = "Year,Month,Account,Type,Value\n";
    
    // Export assets
    (accounts.assets || []).forEach(asset => {
      months.forEach((month, monthIdx) => {
        const value = getSnapshotValue(asset.id, monthIdx);
        csvContent += `${selectedYear},${month},${asset.name},Asset,${value}\n`;
      });
    });
    
    // Export liabilities
    (accounts.liabilities || []).forEach(liability => {
      months.forEach((month, monthIdx) => {
        const value = getSnapshotValue(liability.id, monthIdx);
        csvContent += `${selectedYear},${month},${liability.name},Liability,${value}\n`;
      });
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Enhanced import handler
  const handleImportData = async (importData) => {
    const { accountId, accountName, accountType, monthIndex, value, year } = importData;
    
    // Check if we need to create a new account
    let targetAccountId = accountId;
    if (!targetAccountId) {
      // Check if account already exists
      const existingAccount = [...accounts.assets, ...accounts.liabilities].find(
        a => a.name.toLowerCase() === accountName.toLowerCase()
      );
      
      if (existingAccount) {
        targetAccountId = existingAccount.id;
      } else {
        // Create new account
        const newAccount = await addAccountToDb(accountName, accountType);
        if (newAccount) {
          targetAccountId = newAccount.id;
        }
      }
    }
    
    // Update the snapshot with the value
    if (targetAccountId && year === selectedYear) {
      await updateSnapshot(targetAccountId, monthIndex, value);
    }
  };


  // Prepare chart data
  const prepareNetWorthChartData = () => {
    const chartData = [];
    
    months.forEach((month, monthIdx) => {
      const totals = calculateTotalsForMonth(monthIdx);
      chartData.push({
        month,
        netWorth: totals.netWorth,
        assets: totals.assets,
        liabilities: totals.liabilities
      });
    });
    
    return chartData;
  };

  const prepareAssetBreakdownData = () => {
    const breakdown = [];
    (accounts.assets || []).forEach(asset => {
      const total = months.reduce((sum, _, idx) => sum + getValue(asset.id, idx), 0) / 12;
      if (total > 0) {
        breakdown.push({
          name: asset.name,
          value: total
        });
      }
    });
    return breakdown;
  };

  const prepareTrendData = () => {
    // For now, only show current year data
    // Multi-year trend would require fetching data from multiple years
    const trendData = [];
    let yearTotal = 0;
    let monthCount = 0;
    
    months.forEach((_, monthIdx) => {
      const totals = calculateTotalsForMonth(monthIdx);
      if (totals.netWorth !== 0) {
        yearTotal += totals.netWorth;
        monthCount++;
      }
    });
    
    if (monthCount > 0) {
      trendData.push({
        year: selectedYear,
        avgNetWorth: yearTotal / monthCount
      });
    }
    
    return trendData;
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Show loading spinner while data is loading
  if (dataLoading) {
    return <LoadingSpinner message="Loading your financial data..." />;
  }

  // Show error if there's an issue
  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Error Loading Data</h2>
          </div>
          <p className="text-gray-600 mb-4">{dataError}</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 overflow-visible">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Landmark className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Financial Tracker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Year selector */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg text-gray-700 min-w-[60px] text-center">{selectedYear}</span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Import/Export buttons */}
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="relative z-50" data-import-dropdown>
                  <button
                    ref={importButtonRef}
                    onClick={handleImportOptionsToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Import Options Dropdown */}
                  {showImportOptions && (
                    <div 
                      className={`absolute w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-xl ${
                        dropdownPosition.alignRight ? 'right-0' : 'left-0'
                      } ${
                        dropdownPosition.alignTop ? 'bottom-full mb-1' : 'top-full mt-1'
                      }`}
                      style={{ 
                        zIndex: 9999,
                        maxHeight: window.innerHeight < 400 ? '200px' : '300px',
                        overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(8px)',
                        // Ensure dropdown is always visible on very small screens
                        minWidth: window.innerWidth < 480 ? '180px' : undefined,
                        maxWidth: window.innerWidth < 480 ? '90vw' : undefined
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowImportOptions(false);
                          setShowImportModal(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-800 rounded-t-lg transition-all duration-200 focus:outline-none focus:bg-blue-50 focus:text-blue-800"
                      >
                        <Brain className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Advanced Import</div>
                          <div className="text-sm text-gray-500">Smart mapping & AI detection</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowImportOptions(false);
                          setShowSimpleImportModal(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-b-lg transition-all duration-200 border-t border-gray-100 focus:outline-none focus:bg-green-50 focus:text-green-800"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Simple Import</div>
                          <div className="text-sm text-gray-500">Use standard template</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Net Worth Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-green-700">Total Assets</div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.assets)}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Your total assets
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-red-700">Total Liabilities</div>
                <div className="p-2 bg-red-500 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.liabilities)}</div>
              <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Your total debts
              </div>
            </div>
            
            <div className={`bg-gradient-to-br ${totals.netWorth >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} p-4 rounded-lg border`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-sm font-medium ${totals.netWorth >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Worth</div>
                <div className={`p-2 ${totals.netWorth >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-lg`}>
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.netWorth)}
              </div>
              <div className={`text-xs ${totals.netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1 flex items-center gap-1`}>
                {totals.netWorth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {totals.netWorth >= 0 ? 'Positive net worth' : 'Negative net worth'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 border-b">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 font-medium border-b-2 transition-all ${
                activeTab === 'data' 
                  ? 'text-blue-600 border-blue-600 bg-blue-50 rounded-t-lg' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Data Entry
              </span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 font-medium border-b-2 transition-all ${
                activeTab === 'charts' 
                  ? 'text-blue-600 border-blue-600 bg-blue-50 rounded-t-lg' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <span className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Analytics
              </span>
            </button>
          </div>
        </div>

        {/* Data Entry Tab */}
        {activeTab === 'data' && (
          <>
            {/* Month selector and copy button */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Current Month</div>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="text-lg font-semibold text-gray-700 border-0 p-0 focus:ring-0 cursor-pointer"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={idx}>{month} {selectedYear}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={copyPreviousMonth}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy Previous Month
                </button>
              </div>
            </div>

            {/* Goals Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-500" />
                  Goals
                </h2>
                <button
                  onClick={() => setShowNewGoal(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              {showNewGoal && (
                <div className="flex gap-2 mb-3 p-3 bg-gray-50 rounded">
                  <input
                    type="text"
                    placeholder="Goal name"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Target amount"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-32 px-2 py-1 border rounded"
                  />
                  <button onClick={addGoal} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowNewGoal(false)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(goals || []).map(goal => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                  const isEditingGoal = editingCell === `goal_${goal.id}`;
                  
                  return (
                    <div key={goal.id} className="border rounded-lg p-3 relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium flex items-center gap-1">
                          {progress >= 100 && <Check className="w-4 h-4 text-green-600" />}
                          {goal.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                            {progress.toFixed(0)}%
                          </span>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                            title="Delete goal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isEditingGoal ? (
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => {
                              updateGoalProgress(goal.id, tempValue);
                              setEditingCell(null);
                              setTempValue('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateGoalProgress(goal.id, tempValue);
                                setEditingCell(null);
                                setTempValue('');
                              }
                              if (e.key === 'Escape') {
                                setEditingCell(null);
                                setTempValue('');
                              }
                            }}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => {
                              setEditingCell(`goal_${goal.id}`);
                              setTempValue((goal.current_amount || 0).toString());
                            }}
                            className="flex-1 px-2 py-1 text-sm font-medium cursor-pointer hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all"
                          >
                            {formatCurrency(goal.current_amount || 0)}
                          </div>
                        )}
                        <span className="text-sm text-gray-500">/ {formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 overflow-visible">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Assets
                </h2>
                <button
                  onClick={() => { setNewAccountType('asset'); setShowNewAccount(true); }}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              </div>

              {showNewAccount && newAccountType === 'asset' && (
                <div className="mb-3">
                  <div className="flex gap-2 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Live Icon Preview */}
                      <span className="text-green-600 p-1 bg-white rounded border border-gray-200">
                        {getAccountIcon(newAccountName || 'default').icon}
                      </span>
                      <input
                        type="text"
                        placeholder="Account name (e.g., House, 401k, Savings)"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                      />
                    </div>
                    <button onClick={addAccount} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowNewAccount(false)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Icon Auto-Assignment Guide */}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="font-medium text-blue-900 mb-1">💡 Icon automatically assigned based on keywords:</div>
                    <div className="grid grid-cols-2 gap-1 text-blue-700">
                      <div className="flex items-center gap-1"><Home className="w-3 h-3" /> home, house, property</div>
                      <div className="flex items-center gap-1"><Car className="w-3 h-3" /> car, vehicle, auto</div>
                      <div className="flex items-center gap-1"><PiggyBank className="w-3 h-3" /> 401k, retirement, IRA</div>
                      <div className="flex items-center gap-1"><Wallet className="w-3 h-3" /> save, saving</div>
                      <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> invest, stock, robinhood</div>
                      <div className="flex items-center gap-1"><Coins className="w-3 h-3" /> crypto, bitcoin</div>
                      <div className="flex items-center gap-1"><Heart className="w-3 h-3" /> emergency</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b sticky left-0 bg-white">Account</th>
                    {months.map((month, idx) => (
                      <th key={idx} className={`text-center p-2 border-b min-w-[100px] ${idx === selectedMonth ? 'bg-blue-50' : ''}`}>
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(accounts.assets || []).map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b font-medium sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">{getAccountIcon(asset.name).icon}</span>
                          {asset.name}
                        </div>
                      </td>
                      {months.map((_, monthIdx) => {
                        const cellKey = `${asset.id}_${monthIdx}`;
                        const isEditing = editingCell === cellKey;
                        const value = getValue(asset.id, monthIdx);
                        
                        return (
                          <td key={monthIdx} className={`p-2 border-b text-center ${monthIdx === selectedMonth ? 'bg-blue-50' : ''}`}>
                            {isEditing ? (
                              <input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="w-full px-1 py-0 border rounded text-center"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => startEdit(asset.id, monthIdx)}
                                className="cursor-pointer hover:bg-gray-100 rounded px-1"
                              >
                                {value > 0 ? formatCurrency(value) : '-'}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 border-b text-center">
                        <button
                          onClick={() => deleteAccount(asset.id, 'assets')}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Liabilities Table */}
            <div className="bg-white rounded-lg shadow-sm p-4 overflow-visible">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Liabilities
                </h2>
                <button
                  onClick={() => { setNewAccountType('liability'); setShowNewAccount(true); }}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Liability
                </button>
              </div>

              {showNewAccount && newAccountType === 'liability' && (
                <div className="mb-3">
                  <div className="flex gap-2 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Live Icon Preview */}
                      <span className="text-red-600 p-1 bg-white rounded border border-gray-200">
                        {getAccountIcon(newAccountName || 'default').icon}
                      </span>
                      <input
                        type="text"
                        placeholder="Account name (e.g., Credit Card, Mortgage, Student Loan)"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                      />
                    </div>
                    <button onClick={addAccount} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowNewAccount(false)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Icon Auto-Assignment Guide */}
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
                    <div className="font-medium text-red-900 mb-1">💡 Icon automatically assigned based on keywords:</div>
                    <div className="grid grid-cols-2 gap-1 text-red-700">
                      <div className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> credit, card</div>
                      <div className="flex items-center gap-1"><Landmark className="w-3 h-3" /> loan, mortgage</div>
                      <div className="flex items-center gap-1"><Car className="w-3 h-3" /> car, vehicle, auto</div>
                      <div className="flex items-center gap-1"><School className="w-3 h-3" /> student, education</div>
                      <div className="flex items-center gap-1"><Home className="w-3 h-3" /> home, house</div>
                      <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> all others</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b sticky left-0 bg-white">Account</th>
                    {months.map((month, idx) => (
                      <th key={idx} className={`text-center p-2 border-b min-w-[100px] ${idx === selectedMonth ? 'bg-blue-50' : ''}`}>
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(accounts.liabilities || []).map(liability => (
                    <tr key={liability.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b font-medium sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">{getAccountIcon(liability.name).icon}</span>
                          {liability.name}
                        </div>
                      </td>
                      {months.map((_, monthIdx) => {
                        const cellKey = `${liability.id}_${monthIdx}`;
                        const isEditing = editingCell === cellKey;
                        const value = getValue(liability.id, monthIdx);
                        
                        return (
                          <td key={monthIdx} className={`p-2 border-b text-center ${monthIdx === selectedMonth ? 'bg-blue-50' : ''}`}>
                            {isEditing ? (
                              <input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="w-full px-1 py-0 border rounded text-center"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => startEdit(liability.id, monthIdx)}
                                className="cursor-pointer hover:bg-gray-100 rounded px-1"
                              >
                                {value > 0 ? formatCurrency(value) : '-'}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 border-b text-center">
                        <button
                          onClick={() => deleteAccount(liability.id, 'liabilities')}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-4">
            {/* Net Worth Over Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Net Worth Progression - {selectedYear}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={prepareNetWorthChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="assets" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Assets"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="liabilities" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Liabilities"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Net Worth"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Two column layout for smaller charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Asset Breakdown */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  Asset Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={prepareAssetBreakdownData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareAssetBreakdownData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Comparison */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Assets vs Liabilities
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareNetWorthChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="assets" fill="#10b981" name="Assets" />
                    <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year over Year Trend */}
            {false && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-600" />
                  Multi-Year Net Worth Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={prepareTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="avgNetWorth" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      name="Average Net Worth"
                      dot={{ fill: '#6366f1', r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Goal Progress Chart */}
            {(() => {
              // Dynamic color coding function
              const getCompletionColor = (percentage) => {
                if (percentage >= 100) return '#10b981'; // Green - Complete
                if (percentage > 0) return '#f59e0b';     // Yellow - In Progress  
                return '#6b7280';                         // Gray - Not Started
              };

              // Dynamic data processing with percentage completion
              const processedGoals = (goals || []).map((g, index) => {
                const currentAmount = Math.max(0, parseFloat(g.current_amount) || 0);
                const targetAmount = Math.max(0.01, parseFloat(g.target_amount) || 0.01); // Prevent division by zero
                const completionPercentage = Math.round((currentAmount / targetAmount) * 100);
                
                // Truncate long goal names for better display
                const displayName = g.name && g.name.length > 15 
                  ? g.name.substring(0, 15) + '...' 
                  : g.name || `Goal ${index + 1}`;

                return {
                  name: displayName,
                  fullName: g.name || `Goal ${index + 1}`,
                  current: currentAmount,
                  target: targetAmount,
                  completion: completionPercentage,
                  color: getCompletionColor(completionPercentage),
                  status: completionPercentage >= 100 ? 'Complete' : 
                          completionPercentage > 0 ? 'In Progress' : 'Not Started'
                };
              }).filter(g => g.target > 0.01); // Only valid targets

              // Use only real goals from database
              let finalGoals = processedGoals;

              const hasValidGoals = finalGoals.length > 0;
              
              if (hasValidGoals) {
                // Dynamic Y-axis scaling
                const maxCompletion = Math.max(...finalGoals.map(g => g.completion));
                const yAxisMax = Math.max(110, Math.ceil(maxCompletion / 10) * 10);
                
                // Dynamic height calculation - balanced sizing
                const dynamicHeight = Math.max(350, finalGoals.length * 75);
                
                // Compact bottom margin - minimal white space
                const bottomMargin = finalGoals.length > 5 ? 40 : 30;

                return (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      Goal Progress
                      <span className="text-sm text-gray-500 ml-2">({finalGoals.length} goals)</span>
                    </h3>
                    
                    <ResponsiveContainer width="100%" height={dynamicHeight}>
                      <BarChart 
                        data={finalGoals}
                        margin={{ 
                          top: 15, 
                          right: 25, 
                          left: 15, 
                          bottom: bottomMargin 
                        }}
                        barGap={4}
                        barCategoryGap="15%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name"
                          angle={finalGoals.length > 5 ? -45 : 0}
                          textAnchor={finalGoals.length > 5 ? "end" : "middle"}
                          interval={0}
                          tick={{ fontSize: finalGoals.length > 10 ? 10 : 12 }}
                        />
                        <YAxis 
                          domain={[0, yAxisMax]}
                          tickFormatter={(value) => `${value}%`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const data = props.payload;
                            return [
                              `${value}% complete`,
                              `Goal: ${data.fullName} - ${formatCurrency(data.current)}/${formatCurrency(data.target)} (${data.status})`
                            ];
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullName;
                            }
                            return label;
                          }}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        {/* Dynamic Bar with computed fill colors */}
                        <Bar 
                          dataKey="completion"
                          name="Completion %"
                          fill={(entry) => entry.color}
                          stroke="#ffffff"
                          strokeWidth={1}
                        >
                          {finalGoals.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Dynamic status summary */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Complete ({finalGoals.filter(g => g.completion >= 100).length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>In Progress ({finalGoals.filter(g => g.completion > 0 && g.completion < 100).length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded"></div>
                        <span>Not Started ({finalGoals.filter(g => g.completion === 0).length})</span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      Goal Progress
                    </h3>
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">
                        {goals && goals.length > 0 
                          ? 'No valid goals to display' 
                          : 'No financial goals set yet'
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        {goals && goals.length > 0 
                          ? 'Goals need target amounts greater than 0' 
                          : 'Add goals above to track your progress here'
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>

      {/* Advanced Import Modal */}
      <AdvancedImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          reload(); // Reload data after import
        }}
        onImport={handleImportData}
        selectedYear={selectedYear}
        accounts={{ assets: accounts.assets || [], liabilities: accounts.liabilities || [] }}
      />

      {/* Simple Import Modal */}
      <SimpleImportModal
        isOpen={showSimpleImportModal}
        onClose={() => {
          setShowSimpleImportModal(false);
          reload(); // Reload data after import
        }}
        onImport={handleImportData}
        selectedYear={selectedYear}
        accounts={{ assets: accounts.assets || [], liabilities: accounts.liabilities || [] }}
      />
    </div>
  );
};

export default NetWorthTracker;