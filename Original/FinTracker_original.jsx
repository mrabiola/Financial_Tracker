import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Trash2, Check, ChevronLeft, ChevronRight, Copy, Download, Upload, TrendingUp, PieChart, BarChart3, LineChart, Target, Wallet, CreditCard, DollarSign, TrendingDown, PiggyBank, Landmark, Home, Car, School, Heart, Briefcase, Coins } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const NetWorthTracker = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Initialize with empty data structure
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('financeData');
    return saved ? JSON.parse(saved) : {
      years: {}
    };
  });

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeTab, setActiveTab] = useState('data');
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('asset');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [data]);

  // Initialize year if it doesn't exist
  const initializeYear = (year) => {
    if (!data.years[year]) {
      setData(prev => ({
        ...prev,
        years: {
          ...prev.years,
          [year]: {
            goal: '',
            assets: [],
            liabilities: [],
            goals: [],
            monthlyData: {}
          }
        }
      }));
    }
  };

  useEffect(() => {
    initializeYear(selectedYear);
  }, [selectedYear]);

  const yearData = data.years[selectedYear] || { assets: [], liabilities: [], goals: [], monthlyData: {} };

  // Add new account
  const addAccount = () => {
    if (!newAccountName) return;
    
    const newAccount = {
      id: Date.now(),
      name: newAccountName,
      type: newAccountType
    };

    setData(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [selectedYear]: {
          ...prev.years[selectedYear],
          [newAccountType === 'asset' ? 'assets' : 'liabilities']: [
            ...(prev.years[selectedYear]?.[newAccountType === 'asset' ? 'assets' : 'liabilities'] || []),
            newAccount
          ]
        }
      }
    }));

    setNewAccountName('');
    setShowNewAccount(false);
  };

  // Add new goal
  const addGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    
    const newGoal = {
      id: Date.now(),
      name: newGoalName,
      target: parseFloat(newGoalTarget),
      current: 0
    };

    setData(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [selectedYear]: {
          ...prev.years[selectedYear],
          goals: [...(prev.years[selectedYear]?.goals || []), newGoal]
        }
      }
    }));

    setNewGoalName('');
    setNewGoalTarget('');
    setShowNewGoal(false);
  };

  // Delete goal
  const deleteGoal = (goalId) => {
    setData(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [selectedYear]: {
          ...prev.years[selectedYear],
          goals: prev.years[selectedYear].goals.filter(g => g.id !== goalId)
        }
      }
    }));
  };

  // Delete account
  const deleteAccount = (accountId, type) => {
    setData(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [selectedYear]: {
          ...prev.years[selectedYear],
          [type]: prev.years[selectedYear][type].filter(a => a.id !== accountId)
        }
      }
    }));
  };

  // Get value for a specific account and month
  const getValue = (accountId, monthIndex) => {
    const key = `${accountId}_${monthIndex}`;
    return yearData.monthlyData?.[key] || 0;
  };

  // Set value for a specific account and month
  const setValue = (accountId, monthIndex, value) => {
    const key = `${accountId}_${monthIndex}`;
    const numValue = parseFloat(value) || 0;
    
    setData(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [selectedYear]: {
          ...prev.years[selectedYear],
          monthlyData: {
            ...prev.years[selectedYear].monthlyData,
            [key]: numValue
          }
        }
      }
    }));
  };

  // Update goal progress
  const updateGoalProgress = (goalId, value) => {
    setData(prev => ({
      ...prev,
      years: {
        ...prev.years,
        [selectedYear]: {
          ...prev.years[selectedYear],
          goals: prev.years[selectedYear].goals.map(g => 
            g.id === goalId ? { ...g, current: parseFloat(value) || 0 } : g
          )
        }
      }
    }));
  };

  // Copy previous month's values
  const copyPreviousMonth = () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    
    if (!data.years[prevYear]) return;
    
    const allAccounts = [
      ...(yearData.assets || []),
      ...(yearData.liabilities || [])
    ];

    allAccounts.forEach(account => {
      const prevKey = `${account.id}_${prevMonth}`;
      const prevValue = data.years[prevYear]?.monthlyData?.[prevKey] || 0;
      setValue(account.id, selectedMonth, prevValue);
    });
  };

  // Calculate totals for a specific month
  const calculateTotalsForMonth = (monthIndex, year = selectedYear) => {
    const yearDataForCalc = data.years[year] || { assets: [], liabilities: [], monthlyData: {} };
    let assetTotal = 0;
    let liabilityTotal = 0;

    (yearDataForCalc.assets || []).forEach(asset => {
      const key = `${asset.id}_${monthIndex}`;
      assetTotal += yearDataForCalc.monthlyData?.[key] || 0;
    });

    (yearDataForCalc.liabilities || []).forEach(liability => {
      const key = `${liability.id}_${monthIndex}`;
      liabilityTotal += yearDataForCalc.monthlyData?.[key] || 0;
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
    if (name.includes('house') || name.includes('home') || name.includes('property')) return <Home className="w-4 h-4" />;
    if (name.includes('car') || name.includes('vehicle') || name.includes('auto')) return <Car className="w-4 h-4" />;
    if (name.includes('401k') || name.includes('retirement') || name.includes('ira')) return <PiggyBank className="w-4 h-4" />;
    if (name.includes('save') || name.includes('saving')) return <Wallet className="w-4 h-4" />;
    if (name.includes('invest') || name.includes('stock') || name.includes('robin')) return <TrendingUp className="w-4 h-4" />;
    if (name.includes('crypto') || name.includes('bitcoin')) return <Coins className="w-4 h-4" />;
    if (name.includes('credit') || name.includes('card')) return <CreditCard className="w-4 h-4" />;
    if (name.includes('loan') || name.includes('mortgage')) return <Landmark className="w-4 h-4" />;
    if (name.includes('student') || name.includes('education')) return <School className="w-4 h-4" />;
    if (name.includes('emergency')) return <Heart className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle cell editing
  const startEdit = (accountId, monthIndex) => {
    setEditingCell(`${accountId}_${monthIndex}`);
    setTempValue(getValue(accountId, monthIndex).toString());
  };

  const saveEdit = () => {
    if (editingCell) {
      const [accountId, monthIndex] = editingCell.split('_');
      setValue(parseInt(accountId), parseInt(monthIndex), tempValue);
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
    
    Object.keys(data.years).forEach(year => {
      const yearData = data.years[year];
      
      // Export assets
      (yearData.assets || []).forEach(asset => {
        months.forEach((month, monthIdx) => {
          const value = yearData.monthlyData?.[`${asset.id}_${monthIdx}`] || 0;
          csvContent += `${year},${month},${asset.name},Asset,${value}\n`;
        });
      });
      
      // Export liabilities
      (yearData.liabilities || []).forEach(liability => {
        months.forEach((month, monthIdx) => {
          const value = yearData.monthlyData?.[`${liability.id}_${monthIdx}`] || 0;
          csvContent += `${year},${month},${liability.name},Liability,${value}\n`;
        });
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

  // Import from CSV
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const newData = { years: {} };
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const year = parseInt(values[0]);
        const month = values[1];
        const accountName = values[2];
        const accountType = values[3].toLowerCase();
        const value = parseFloat(values[4]) || 0;
        
        // Initialize year if needed
        if (!newData.years[year]) {
          newData.years[year] = {
            assets: [],
            liabilities: [],
            goals: [],
            monthlyData: {}
          };
        }
        
        // Find or create account
        const accountList = accountType === 'asset' ? 'assets' : 'liabilities';
        let account = newData.years[year][accountList].find(a => a.name === accountName);
        
        if (!account) {
          account = {
            id: Date.now() + Math.random(),
            name: accountName,
            type: accountType
          };
          newData.years[year][accountList].push(account);
        }
        
        // Set value
        const monthIndex = months.indexOf(month);
        if (monthIndex !== -1) {
          const key = `${account.id}_${monthIndex}`;
          newData.years[year].monthlyData[key] = value;
        }
      }
      
      setData(newData);
      alert('Data imported successfully!');
    };
    
    reader.readAsText(file);
    event.target.value = '';
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
    (yearData.assets || []).forEach(asset => {
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
    const years = Object.keys(data.years).sort();
    const trendData = [];
    
    years.forEach(year => {
      let yearTotal = 0;
      let monthCount = 0;
      
      months.forEach((_, monthIdx) => {
        const totals = calculateTotalsForMonth(monthIdx, year);
        if (totals.netWorth !== 0) {
          yearTotal += totals.netWorth;
          monthCount++;
        }
      });
      
      if (monthCount > 0) {
        trendData.push({
          year,
          avgNetWorth: yearTotal / monthCount
        });
      }
    });
    
    return trendData;
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Tracker</h1>
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
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importFromCSV}
                    className="hidden"
                  />
                </label>
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
                {(yearData.goals || []).map(goal => {
                  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
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
                              setTempValue(goal.current.toString());
                            }}
                            className="flex-1 px-2 py-1 text-sm font-medium cursor-pointer hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all"
                          >
                            {formatCurrency(goal.current)}
                          </div>
                        )}
                        <span className="text-sm text-gray-500">/ {formatCurrency(goal.target)}</span>
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
                <div className="flex gap-2 mb-3 p-3 bg-gray-50 rounded">
                  <input
                    type="text"
                    placeholder="Account name"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <button onClick={addAccount} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowNewAccount(false)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
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
                  {(yearData.assets || []).map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b font-medium sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">{getAccountIcon(asset.name)}</span>
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
                <div className="flex gap-2 mb-3 p-3 bg-gray-50 rounded">
                  <input
                    type="text"
                    placeholder="Account name"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <button onClick={addAccount} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowNewAccount(false)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
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
                  {(yearData.liabilities || []).map(liability => (
                    <tr key={liability.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b font-medium sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">{getAccountIcon(liability.name)}</span>
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
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
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
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="assets" fill="#10b981" name="Assets" />
                    <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year over Year Trend */}
            {Object.keys(data.years).length > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-600" />
                  Multi-Year Net Worth Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={prepareTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
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
            {yearData.goals && yearData.goals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Goal Progress
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={yearData.goals.map(g => ({
                      name: g.name,
                      current: g.current,
                      target: g.target,
                      remaining: Math.max(0, g.target - g.current)
                    }))}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="current" stackId="a" fill="#10b981" name="Current" />
                    <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetWorthTracker;