import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus, X, Trash2, Check, ChevronLeft, ChevronRight, ChevronDown, Copy, Download, Upload, TrendingUp, PieChart, BarChart3, LineChart, Target, Wallet, CreditCard, DollarSign, TrendingDown, PiggyBank, Landmark, Home, Car, School, Heart, Briefcase, Coins, AlertCircle, FileSpreadsheet, Calendar, TrendingUp as TrendUpIcon, TrendingDown as TrendDownIcon, Banknote, ArrowDownCircle, ArrowUpCircle, Activity, Gauge } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { useFinancialDataDemo } from '../../hooks/useFinancialDataDemo';
import { getConversionIndicator } from '../../utils/currencyConversion';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCashflowData } from '../../hooks/useCashflowData';
import LoadingSpinner from '../common/LoadingSpinner';
import SimpleImportModal from './SimpleImportModal';
import SmartAssetModal from './SmartAssetModal';
import CashflowSection from './CashflowSection';
import { useApiAssets } from '../../hooks/useApiAssets';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileNetWorthView from '../mobile/MobileNetWorthView';
import MobileCashflowView from '../mobile/MobileCashflowView';
import MobileAnalyticsView from '../mobile/MobileAnalyticsView';

const NetWorthTracker = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Mobile detection
  const isMobile = useIsMobile();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Use currency context for formatting
  const { formatCurrency, formatCurrencyShort, getCurrencySymbol, currency } = useCurrency();

  // Use demo-aware data hook with currency support
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
    getSnapshotCurrencyData,
    fetchMultiYearSnapshots,
    reload
  } = useFinancialDataDemo(selectedYear);

  // API assets hook (will get yearId internally)
  const { addApiAsset } = useApiAssets();

  // Cashflow data hook
  const {
    cashflowData,
    incomeCategories,
    expenseCategories,
    saveCashflowData,
    calculateMetrics: calculateCashflowMetrics,
    copyPreviousMonth: copyCashflowPreviousMonth,
    addCategory,
    deleteCategory
  } = useCashflowData(selectedYear);

  // State for multi-year data
  const [multiYearData, setMultiYearData] = useState({});
  const hasLoadedMultiYearData = useRef(false);

  const [activeTab, setActiveTab] = useState('data');
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('asset');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showSimpleImportModal, setShowSimpleImportModal] = useState(false);
  const [showSmartAssetModal, setShowSmartAssetModal] = useState(false);
  const [smartAssetType, setSmartAssetType] = useState('asset');
  const [dropdownPosition, setDropdownPosition] = useState({ alignRight: false, alignTop: false });
  const [assetChartView, setAssetChartView] = useState('summary'); // 'summary' or 'detailed'
  const [showOtherTooltip, setShowOtherTooltip] = useState(false);
  const [showMonthPopup, setShowMonthPopup] = useState(false);
  const [showYearPopup, setShowYearPopup] = useState(false);

  // New state for MoM/YoY view and time periods
  const [chartViewType, setChartViewType] = useState('MoM'); // 'MoM' or 'YoY'
  const [timeFrame, setTimeFrame] = useState('ALL'); // 'YTD', '6M', '3M', '1Y', '3Y', '5Y', 'ALL'
  const [availableYears, setAvailableYears] = useState([]);
  const importButtonRef = useRef(null);
  const monthButtonRef = useRef(null);
  const yearButtonRef = useRef(null);

  // Close dropdowns and popups when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showImportOptions && !event.target.closest('[data-import-dropdown]')) {
        setShowImportOptions(false);
      }
      if (showMonthPopup && !event.target.closest('[data-month-picker]')) {
        setShowMonthPopup(false);
      }
      if (showYearPopup && !event.target.closest('[data-year-picker]')) {
        setShowYearPopup(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (showImportOptions) setShowImportOptions(false);
        if (showMonthPopup) setShowMonthPopup(false);
        if (showYearPopup) setShowYearPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showImportOptions, showMonthPopup, showYearPopup]);

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
  const getValue = useCallback((accountId, monthIndex) => {
    return getSnapshotValue(accountId, monthIndex);
  }, [getSnapshotValue]);

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

  // Enhanced import handler with proper account deduplication
  const handleImportData = async (importData) => {
    const { accountId, accountName, accountType, monthIndex, value, year } = importData;

    // Check if we need to create a new account
    let targetAccountId = accountId;
    if (!targetAccountId) {
      // Check if account already exists (search in current accounts state)
      const existingAccount = [...accounts.assets, ...accounts.liabilities].find(
        a => a.name.toLowerCase() === accountName.toLowerCase()
      );

      if (existingAccount) {
        targetAccountId = existingAccount.id;
      } else {
        // Create new account only if it doesn't exist
        const newAccount = await addAccountToDb(accountName, accountType);
        if (newAccount) {
          targetAccountId = newAccount.id;

          // Immediately update the local accounts state to prevent duplicate creation
          // This ensures subsequent calls see the newly created account
          if (accountType === 'asset') {
            accounts.assets.push(newAccount);
          } else {
            accounts.liabilities.push(newAccount);
          }
        }
      }
    }

    // Update the snapshot with the value
    if (targetAccountId && year === selectedYear) {
      await updateSnapshot(targetAccountId, monthIndex, value);
    }
  };


  // Helper function to determine available years based on data
  useEffect(() => {
    // For now, we'll support the current year and recent years
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 4; i <= currentYear; i++) {
      years.push(i);
    }
    setAvailableYears(years);
  }, []);

  // Create stable account IDs array to prevent unnecessary re-renders
  const accountIds = useMemo(() => {
    const ids = [
      ...(accounts.assets || []).map(a => a.id),
      ...(accounts.liabilities || []).map(a => a.id)
    ];
    // Reset the loaded flag when account IDs change
    if (ids.length > 0) {
      hasLoadedMultiYearData.current = false;
    }
    return ids;
  }, [accounts.assets, accounts.liabilities]);

  // Load multi-year data for YoY charts
  const loadMultiYearData = useCallback(async () => {
    if (!fetchMultiYearSnapshots || availableYears.length === 0 || accountIds.length === 0) {
      return;
    }

    try {
      const data = await fetchMultiYearSnapshots(accountIds, availableYears);
      setMultiYearData(data);
      hasLoadedMultiYearData.current = true;
    } catch (error) {
      console.error('Error loading multi-year data:', error);
    }
  }, [fetchMultiYearSnapshots, availableYears, accountIds]);

  // Load multi-year data when switching to YoY view
  useEffect(() => {
    if (chartViewType === 'YoY' && accountIds.length > 0) {
      loadMultiYearData();
    }
  }, [chartViewType, loadMultiYearData, accountIds.length]);

  // Preload multi-year data when accounts first become available
  useEffect(() => {
    if (accountIds.length > 0 && !hasLoadedMultiYearData.current) {
      loadMultiYearData();
    }
  }, [accountIds.length, loadMultiYearData]);

  // Get date range based on time frame
  const getDateRange = (timeFrame, currentDate = new Date()) => {
    const endMonth = currentDate.getMonth();
    const endYear = currentDate.getFullYear();
    let startMonth = 0;
    let startYear = endYear;

    switch (timeFrame) {
      case 'YTD':
        startMonth = 0;
        startYear = endYear;
        break;
      case '3M':
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
        startMonth = threeMonthsAgo.getMonth();
        startYear = threeMonthsAgo.getFullYear();
        break;
      case '6M':
        const sixMonthsAgo = new Date(currentDate);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        startMonth = sixMonthsAgo.getMonth();
        startYear = sixMonthsAgo.getFullYear();
        break;
      case '1Y':
        startMonth = endMonth;
        startYear = endYear - 1;
        break;
      case '3Y':
        startMonth = endMonth;
        startYear = endYear - 3;
        break;
      case '5Y':
        startMonth = endMonth;
        startYear = endYear - 5;
        break;
      case 'ALL':
        startMonth = 0;
        startYear = Math.min(...availableYears.filter(y => y > 0));
        break;
      default:
        startMonth = 0;
        startYear = endYear;
    }

    return { startMonth, startYear, endMonth, endYear };
  };

  // Prepare chart data with month-to-month percentage differences
  const prepareNetWorthChartData = () => {
    const chartData = [];
    const { startMonth, startYear, endMonth, endYear } = getDateRange(timeFrame);

    // Filter data based on time frame
    let monthsToShow = [];

    if (startYear === endYear && selectedYear === endYear) {
      // Same year - show months from start to end (or current month)
      const lastMonth = timeFrame === 'YTD' || timeFrame === '3M' || timeFrame === '6M'
        ? Math.min(endMonth, currentMonth)
        : 11;
      for (let i = startMonth; i <= lastMonth; i++) {
        monthsToShow.push(i);
      }
    } else if (selectedYear === endYear) {
      // Current year selected, showing all months
      monthsToShow = months.map((_, idx) => idx);
    } else {
      // Historical year or ALL view
      monthsToShow = months.map((_, idx) => idx);
    }

    monthsToShow.forEach((monthIdx) => {
      const totals = calculateTotalsForMonth(monthIdx);
      let assetGrowth = null;
      let liabilityGrowth = null;
      let netWorthGrowth = null;

      // Calculate month-to-month percentage changes
      if (monthIdx > 0 && monthsToShow.includes(monthIdx - 1)) {
        const prevTotals = calculateTotalsForMonth(monthIdx - 1);

        // Assets growth calculation
        if (prevTotals.assets > 0) {
          assetGrowth = ((totals.assets - prevTotals.assets) / prevTotals.assets) * 100;
        }

        // Liabilities growth calculation
        if (prevTotals.liabilities > 0) {
          liabilityGrowth = ((totals.liabilities - prevTotals.liabilities) / prevTotals.liabilities) * 100;
        }

        // Net worth growth calculation
        if (prevTotals.netWorth !== 0) {
          netWorthGrowth = ((totals.netWorth - prevTotals.netWorth) / Math.abs(prevTotals.netWorth)) * 100;
        }
      }

      chartData.push({
        month: months[monthIdx],
        monthIndex: monthIdx,
        netWorth: totals.netWorth,
        assets: totals.assets,
        liabilities: totals.liabilities,
        assetGrowth,
        liabilityGrowth,
        netWorthGrowth,
        prevAssets: monthIdx > 0 ? calculateTotalsForMonth(monthIdx - 1).assets : null,
        prevLiabilities: monthIdx > 0 ? calculateTotalsForMonth(monthIdx - 1).liabilities : null,
        prevNetWorth: monthIdx > 0 ? calculateTotalsForMonth(monthIdx - 1).netWorth : null
      });
    });

    return chartData;
  };

  // Calculate totals for a specific month and year using multi-year data
  const calculateTotalsForYearMonth = (year, monthIndex) => {
    let assetTotal = 0;
    let liabilityTotal = 0;

    // Use multi-year data if available, otherwise fall back to current year data
    const yearSnapshots = multiYearData[year]?.snapshots || (year === selectedYear ? {} : {});

    if (year === selectedYear) {
      // For current selected year, use current accounts structure
      (accounts.assets || []).forEach(asset => {
        assetTotal += getSnapshotValue(asset.id, monthIndex);
      });

      (accounts.liabilities || []).forEach(liability => {
        liabilityTotal += getSnapshotValue(liability.id, monthIndex);
      });
    } else {
      // For historical years, iterate through ALL snapshot keys to find accounts
      Object.keys(yearSnapshots).forEach(key => {
        if (key.endsWith(`_${monthIndex}`)) {
          const accountId = key.split('_')[0];
          const value = yearSnapshots[key] || 0;

          // We need to determine if this is an asset or liability
          // Check if this account exists in current accounts to determine type
          const isAsset = (accounts.assets || []).some(a => a.id === accountId);
          const isLiability = (accounts.liabilities || []).some(l => l.id === accountId);

          if (isAsset) {
            assetTotal += value;
          } else if (isLiability) {
            liabilityTotal += value;
          } else {
            // For historical accounts not in current year, use account type mapping
            const accountTypeMap = multiYearData?.accountTypeMap || {};
            const accountType = accountTypeMap[accountId];

            if (accountType === 'asset') {
              assetTotal += value;
            } else if (accountType === 'liability') {
              liabilityTotal += value;
            } else {
              // Fallback: assume positive values are assets, negative are liabilities
              if (value >= 0) {
                assetTotal += value;
              } else {
                liabilityTotal += Math.abs(value);
              }
            }
          }
        }
      });
    }

    return {
      assets: assetTotal,
      liabilities: liabilityTotal,
      netWorth: assetTotal - liabilityTotal
    };
  };

  // Prepare Year-over-Year comparison data
  const prepareYoYChartData = () => {
    // Use selectedYear as the basis for all comparisons, not the real current year
    const baseYear = selectedYear;
    const realCurrentYear = new Date().getFullYear();

    // Determine which years to compare based on timeFrame
    let yearsToCompare = [];

    switch (timeFrame) {
      case 'YTD':
      case '1Y':
        // Compare last few years relative to selected year (monthly data)
        yearsToCompare = [baseYear - 2, baseYear - 1, baseYear].filter(y => y >= baseYear - 4 && y <= realCurrentYear);
        break;
      case '3Y':
        // 3 years ending at selected year
        yearsToCompare = [baseYear - 2, baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
        break;
      case '5Y':
        // 5 years ending at selected year
        yearsToCompare = [baseYear - 4, baseYear - 3, baseYear - 2, baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
        break;
      case 'ALL':
        // All available years up to selected year
        yearsToCompare = availableYears.filter(y => y <= baseYear && y <= realCurrentYear);
        break;
      default:
        yearsToCompare = [baseYear - 1, baseYear].filter(y => y <= realCurrentYear);
    }

    // Filter to only years that might have data
    const yearsWithPossibleData = yearsToCompare.filter(year =>
      year === selectedYear || multiYearData[year] || year >= currentYear - 5
    );

    if (yearsWithPossibleData.length === 0) {
      return { chartData: [], years: [], chartType: 'monthly' };
    }

    // Determine chart type: monthly (YTD/1Y) vs annual (3Y/5Y/ALL)
    const isMonthlyChart = timeFrame === 'YTD' || timeFrame === '1Y';

    if (isMonthlyChart) {
      // Monthly YoY Chart: X-axis = months, multiple year lines
      return prepareMonthlyYoYData(yearsWithPossibleData);
    } else {
      // Annual YoY Chart: X-axis = years, annual totals
      return prepareAnnualYoYData(yearsWithPossibleData);
    }
  };

  // Prepare monthly YoY data (for YTD/1Y timeframes)
  const prepareMonthlyYoYData = (years) => {
    const chartData = [];
    const realCurrentYear = new Date().getFullYear();
    const realCurrentMonth = new Date().getMonth();

    // Determine months to show based on selected year and timeframe
    let monthsToShow;
    if (timeFrame === 'YTD') {
      // If viewing current real year, show up to current month
      // If viewing past year, show all 12 months
      if (selectedYear === realCurrentYear) {
        monthsToShow = Array.from({ length: realCurrentMonth + 1 }, (_, i) => i);
      } else {
        monthsToShow = Array.from({ length: 12 }, (_, i) => i);
      }
    } else {
      // For 1Y, always show all 12 months
      monthsToShow = Array.from({ length: 12 }, (_, i) => i);
    }

    monthsToShow.forEach(monthIdx => {
      const dataPoint = {
        month: months[monthIdx],
        monthIndex: monthIdx
      };

      years.forEach(year => {
        const totals = calculateTotalsForYearMonth(year, monthIdx);
        // Only include data if we have meaningful values
        if (totals.netWorth !== 0 || year === selectedYear) {
          dataPoint[`netWorth_${year}`] = totals.netWorth;
        }
      });

      chartData.push(dataPoint);
    });

    return {
      chartData,
      years: years.filter(y => {
        // Only include years that have some data
        return chartData.some(d => d[`netWorth_${y}`] !== undefined);
      }),
      chartType: 'monthly'
    };
  };

  // Prepare annual YoY data (for 3Y/5Y/ALL timeframes)
  const prepareAnnualYoYData = (years) => {
    const chartData = [];
    console.log('Preparing annual YoY data for years:', years);
    console.log('MultiYearData available:', Object.keys(multiYearData));

    years.forEach(year => {
      console.log(`Processing year ${year}...`);

      // Calculate annual totals - look for the best available month data
      let yearTotal = 0;
      let hasData = false;
      let bestMonth = -1;

      // Check all months for this year to find data
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const totals = calculateTotalsForYearMonth(year, monthIdx);
        console.log(`Year ${year}, Month ${monthIdx}:`, totals);

        if (totals.netWorth !== 0) {
          hasData = true;
          bestMonth = monthIdx;
          yearTotal = totals.netWorth; // Keep updating to get the latest month's data
        }
      }

      // For the current real year, use the latest available data
      const realCurrentYear = new Date().getFullYear();
      const realCurrentMonth = new Date().getMonth();

      if (year === realCurrentYear && year === selectedYear) {
        // If viewing the actual current year, use current month
        const currentTotals = calculateTotalsForYearMonth(year, realCurrentMonth);
        if (currentTotals.netWorth !== 0 || !hasData) {
          yearTotal = currentTotals.netWorth;
          hasData = true;
          console.log(`Using current real year ${year} data:`, currentTotals);
        }
      } else if (year === selectedYear) {
        // If viewing a past selected year, use December or last available month
        if (!hasData || yearTotal === 0) {
          const decemberTotals = calculateTotalsForYearMonth(year, 11);
          if (decemberTotals.netWorth !== 0) {
            yearTotal = decemberTotals.netWorth;
            hasData = true;
            console.log(`Using selected year ${year} December data:`, decemberTotals);
          }
        }
      }

      // Always include years in our target range, even with zero data to show progression
      console.log(`Year ${year}: hasData=${hasData}, yearTotal=${yearTotal}, bestMonth=${bestMonth}`);

      chartData.push({
        year: year.toString(),
        netWorth: yearTotal,
        yearNum: year,
        hasActualData: hasData
      });
    });

    // Sort by year
    chartData.sort((a, b) => a.yearNum - b.yearNum);

    console.log('Final annual chart data:', chartData);

    return {
      chartData,
      years: chartData.map(d => d.yearNum),
      chartType: 'annual'
    };
  };

  // Memoize asset breakdown calculations to prevent re-renders
  const assetBreakdownData = useMemo(() => {
    const breakdown = [];
    let totalValue = 0;
    
    // Calculate all asset values
    (accounts.assets || []).forEach(asset => {
      const value = getValue(asset.id, selectedMonth);
      // Only include assets with positive values
      if (value > 0) {
        breakdown.push({
          name: asset.name,
          value: value
        });
        totalValue += value;
      }
    });
    
    // Sort by value (largest first)
    breakdown.sort((a, b) => b.value - a.value);
    
    return { breakdown, totalValue };
  }, [accounts.assets, selectedMonth, getValue]);

  // Memoize summary data with "Other" grouping
  const summaryData = useMemo(() => {
    const { breakdown, totalValue } = assetBreakdownData;
    
    if (breakdown.length === 0) return { majorAssets: [], minorAssets: [] };
    
    // Group assets under 5% into "Other"
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
    
    // Add "Other" category if there are minor assets
    if (minorAssets.length > 0) {
      const otherTotal = minorAssets.reduce((sum, asset) => sum + asset.value, 0);
      majorAssets.push({
        name: 'Other',
        value: otherTotal,
        isOther: true,
        count: minorAssets.length
      });
    }
    
    return { majorAssets, minorAssets };
  }, [assetBreakdownData]);


  // Helper function to get the appropriate data based on view mode
  const getChartData = (viewMode = 'summary') => {
    if (viewMode === 'summary') {
      return summaryData.majorAssets;
    }
    // Filter out zero values for chart display
    return assetBreakdownData.breakdown.filter(asset => asset.value > 0);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 flex items-center justify-center text-gray-900 dark:text-gray-100">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Error Loading Data</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{dataError}</p>
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

  // Mobile View - completely different UI optimized for touch
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 text-gray-900 dark:text-gray-100 pb-safe">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">WealthTrak</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[50px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'data'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Netsheet
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'charts'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <LineChart className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cashflow'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Cashflow
          </button>
        </div>

        {/* Mobile Content */}
        {activeTab === 'data' && (
          <MobileNetWorthView
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            accounts={accounts}
            goals={goals}
            getSnapshotValue={getSnapshotValue}
            updateSnapshot={updateSnapshot}
            addAccount={addAccountToDb}
            deleteAccount={deleteAccountFromDb}
            addGoal={addGoalToDb}
            updateGoalProgress={updateGoalProgress}
            deleteGoal={deleteGoalFromDb}
            formatCurrency={formatCurrency}
            formatCurrencyShort={formatCurrencyShort}
            getCurrencySymbol={getCurrencySymbol}
            currency={currency}
            copyPreviousMonth={copyPreviousMonth}
          />
        )}
        {activeTab === 'charts' && (
          <MobileAnalyticsView
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            accounts={accounts}
            goals={goals}
            getSnapshotValue={getSnapshotValue}
            formatCurrency={formatCurrency}
            formatCurrencyShort={formatCurrencyShort}
            getCurrencySymbol={getCurrencySymbol}
            currency={currency}
          />
        )}
        {activeTab === 'cashflow' && (
          <MobileCashflowView
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            cashflowData={cashflowData}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            saveCashflowData={saveCashflowData}
            copyPreviousMonth={copyCashflowPreviousMonth}
            addCategory={addCategory}
            calculateMetrics={calculateCashflowMetrics}
            formatCurrency={formatCurrency}
            formatCurrencyShort={formatCurrencyShort}
            getCurrencySymbol={getCurrencySymbol}
            currency={currency}
          />
        )}
      </div>
    );
  }

  // Desktop View - original UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 text-gray-900 dark:text-gray-100">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 mb-4 overflow-visible">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Landmark className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Financial Tracker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Enhanced Year Selector */}
              <div className="relative" data-year-picker>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedYear(selectedYear - 1)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                    title="Previous Year"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    ref={yearButtonRef}
                    onClick={() => setShowYearPopup(!showYearPopup)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedYear}</span>
                  </button>
                  <button
                    onClick={() => setSelectedYear(selectedYear + 1)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                    title="Next Year"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Year Popup */}
                {showYearPopup && (
                  <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-4 z-50" style={{ minWidth: '280px' }}>
                    <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Select Year</div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setShowYearPopup(false);
                          }}
                          className={`px-3 py-2 text-sm rounded-lg transition-all ${
                            year === selectedYear
                              ? 'bg-blue-600 text-white font-semibold'
                              : year === currentYear
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Import/Export buttons */}
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="relative z-50" data-import-dropdown>
                  <button
                    ref={importButtonRef}
                    onClick={handleImportOptionsToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Import Options Dropdown */}
                  {showImportOptions && (
                    <div 
                      className={`absolute w-56 sm:w-64 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl ${
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
                          setShowSimpleImportModal(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-800 dark:hover:text-green-200 rounded-lg transition-all duration-200 focus:outline-none focus:bg-green-50 dark:focus:bg-green-950/30 focus:text-green-800 dark:focus:text-green-200"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Simple Import</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Use standard template</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Dashboard Cards Based on Active Tab */}
          {activeTab === 'cashflow' ? (
            // Cashflow Dashboard Cards
            (() => {
              const metrics = calculateCashflowMetrics(selectedMonth);
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                  {/* Cash Inflow Card */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-t-green-500 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Cash Inflow</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{formatCurrency(metrics.monthIncome || 0)}</div>
                        <div className="text-sm font-medium text-green-600">
                          YTD: {formatCurrency(metrics.ytdIncome)}
                        </div>
                      </div>
                      <div className="text-green-500 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ArrowDownCircle className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Cash Outflow Card */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-t-red-500 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Cash Outflow</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{formatCurrency(metrics.monthExpenses || 0)}</div>
                        <div className="text-sm font-medium text-red-600">
                          YTD: {formatCurrency(metrics.ytdExpenses)}
                        </div>
                      </div>
                      <div className="text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ArrowUpCircle className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Net Cash Flow Card */}
                  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 ${metrics.netCashflow >= 0 ? 'border-t-blue-500' : 'border-t-orange-500'} transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Net Flow</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {formatCurrency(metrics.monthNetCashflow || 0)}
                        </div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {(metrics.monthNetCashflow || 0) >= 0 ? (
                            <span className="text-green-600">Positive cashflow</span>
                          ) : (
                            <span className="text-red-600">Negative cashflow</span>
                          )}
                        </div>
                      </div>
                      <div className={`${metrics.netCashflow >= 0 ? 'text-blue-500' : 'text-orange-500'} opacity-80 group-hover:opacity-100 transition-opacity`}>
                        <Activity className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Savings Rate Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-white/90 uppercase tracking-wider mb-2">Savings Rate</div>
                        <div className="text-3xl font-bold mb-1">
                          {(metrics.monthSavingsRate || 0).toFixed(1)}%
                        </div>
                        <div className="text-sm font-medium text-white/80">
                          YTD: {metrics.ytdSavingsRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-white/80 group-hover:text-white transition-colors">
                        <PiggyBank className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* YTD Performance Card */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-t-indigo-500 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">YTD Performance</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {formatCurrency(metrics.ytdNetCashflow)}
                        </div>
                        <div className="text-sm font-medium text-indigo-600">
                          {metrics.ytdNetCashflow >= 0 ? 'Surplus' : 'Deficit'}
                        </div>
                      </div>
                      <div className="text-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Gauge className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            // Original Net Worth Dashboard Cards
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Total Assets Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-t-green-500 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Total Assets</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">{formatCurrency(totals.assets)}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {accounts.assets?.length || 0} active {(accounts.assets?.length || 0) === 1 ? 'account' : 'accounts'}
                    </div>
                  </div>
                  <div className="text-green-500 opacity-80 group-hover:opacity-100 transition-opacity">
                    <TrendUpIcon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Total Liabilities Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-t-red-500 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Total Liabilities</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">{formatCurrency(totals.liabilities)}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {accounts.liabilities?.length || 0} active {(accounts.liabilities?.length || 0) === 1 ? 'account' : 'accounts'}
                    </div>
                  </div>
                  <div className="text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                    <TrendDownIcon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Net Worth Card */}
              <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 ${totals.netWorth >= 0 ? 'border-t-blue-500' : 'border-t-orange-500'} transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Net Worth</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {formatCurrency(totals.netWorth)}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {totals.netWorth >= 0 ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Positive net worth
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Negative net worth
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`${totals.netWorth >= 0 ? 'text-blue-500' : 'text-orange-500'} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <Wallet className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 font-medium border-b-2 transition-all ${
                activeTab === 'data' 
                  ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-t-lg' 
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-t-lg'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Netsheet
              </span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 font-medium border-b-2 transition-all ${
                activeTab === 'charts'
                  ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-t-lg'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-t-lg'
              }`}
            >
              <span className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Analytics
              </span>
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`px-4 py-2 font-medium border-b-2 transition-all ${
                activeTab === 'cashflow'
                  ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-t-lg'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-t-lg'
              }`}
            >
              <span className="flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                Cashflow
              </span>
            </button>
          </div>
        </div>

        {/* Netsheet Tab */}
        {activeTab === 'data' && (
          <>
            {/* Month selector and copy button */}
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Enhanced Month Selector */}
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
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                        title="Previous Month"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        ref={monthButtonRef}
                        onClick={() => setShowMonthPopup(!showMonthPopup)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer min-w-[100px]"
                      >
                        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{months[selectedMonth]}</span>
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
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                        title="Next Month"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Month Popup */}
                    {showMonthPopup && (
                      <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-4 z-50" style={{ minWidth: '300px' }}>
                        <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Select Month</div>
                        <div className="grid grid-cols-4 gap-2">
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
                                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Year: {selectedYear}</div>
                        </div>
                      </div>
                    )}
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
                <div className="flex gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded">
                  <input
                    type="text"
                    placeholder="Goal name"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                  />
                  <input
                    type="number"
                    placeholder="Target amount"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
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
                    <div key={goal.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 relative bg-white dark:bg-gray-950/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          {progress >= 100 && <Check className="w-4 h-4 text-green-600" />}
                          {goal.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            {progress.toFixed(0)}%
                          </span>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-all"
                            title="Delete goal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-3">
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
                            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => {
                              setEditingCell(`goal_${goal.id}`);
                              setTempValue((goal.current_amount || 0).toString());
                            }}
                            className="flex-1 px-2 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                          >
                            {formatCurrency(goal.current_amount || 0)}
                          </div>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">/ {formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 mb-4 overflow-visible">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Assets
                </h2>
                <button
                  onClick={() => { setSmartAssetType('asset'); setShowSmartAssetModal(true); }}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              </div>

              {showNewAccount && newAccountType === 'asset' && (
                <div className="mb-3">
                  <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Live Icon Preview */}
                      <span className="text-green-600 p-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800">
                        {getAccountIcon(newAccountName || 'default').icon}
                      </span>
                      <input
                        type="text"
                        placeholder="Account name (e.g., House, 401k, Savings)"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
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
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded text-xs">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Icon automatically assigned based on keywords:</div>
                    <div className="grid grid-cols-2 gap-1 text-blue-700 dark:text-blue-200">
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
                <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-white dark:bg-gray-900 w-48">Account</th>
                    {months.map((month, idx) => (
                      <th key={idx} className={`text-center p-2 border-b border-gray-200 dark:border-gray-800 w-24 ${idx === selectedMonth ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-2 border-b border-gray-200 dark:border-gray-800 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(accounts.assets || []).map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-2 border-b border-gray-200 dark:border-gray-800 font-medium sticky left-0 bg-white dark:bg-gray-900">
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
                          <td key={monthIdx} className={`p-2 border-b border-gray-200 dark:border-gray-800 text-center ${monthIdx === selectedMonth ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
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
                                className="w-full px-1 py-0 border border-gray-300 dark:border-gray-700 rounded text-center bg-white dark:bg-gray-950"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => startEdit(asset.id, monthIdx)}
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded px-1 relative group"
                              >
                                {value > 0 ? formatCurrency(value) : '-'}
                                {value > 0 && (() => {
                                  const currencyData = getSnapshotCurrencyData(asset.id, monthIdx);
                                  const indicator = currencyData ? getConversionIndicator(currencyData) : '';
                                  return indicator ? (
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                      {indicator}
                                    </span>
                                  ) : null;
                                })()}
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 overflow-visible">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Liabilities
                </h2>
                <button
                  onClick={() => { setSmartAssetType('liability'); setShowSmartAssetModal(true); }}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Liability
                </button>
              </div>

              {showNewAccount && newAccountType === 'liability' && (
                <div className="mb-3">
                  <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Live Icon Preview */}
                      <span className="text-red-600 p-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800">
                        {getAccountIcon(newAccountName || 'default').icon}
                      </span>
                      <input
                        type="text"
                        placeholder="Account name (e.g., Credit Card, Mortgage, Student Loan)"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
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
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded text-xs">
                    <div className="font-medium text-red-900 dark:text-red-100 mb-1">💡 Icon automatically assigned based on keywords:</div>
                    <div className="grid grid-cols-2 gap-1 text-red-700 dark:text-red-200">
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
                <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-white dark:bg-gray-900 w-48">Account</th>
                    {months.map((month, idx) => (
                      <th key={idx} className={`text-center p-2 border-b border-gray-200 dark:border-gray-800 w-24 ${idx === selectedMonth ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-2 border-b border-gray-200 dark:border-gray-800 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(accounts.liabilities || []).map(liability => (
                    <tr key={liability.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-2 border-b border-gray-200 dark:border-gray-800 font-medium sticky left-0 bg-white dark:bg-gray-900">
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
                          <td key={monthIdx} className={`p-2 border-b border-gray-200 dark:border-gray-800 text-center ${monthIdx === selectedMonth ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
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
                                className="w-full px-1 py-0 border border-gray-300 dark:border-gray-700 rounded text-center bg-white dark:bg-gray-950"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => startEdit(liability.id, monthIdx)}
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded px-1 relative group"
                              >
                                {value > 0 ? formatCurrency(value) : '-'}
                                {value > 0 && (() => {
                                  const currencyData = getSnapshotCurrencyData(liability.id, monthIdx);
                                  const indicator = currencyData ? getConversionIndicator(currencyData) : '';
                                  return indicator ? (
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                      {indicator}
                                    </span>
                                  ) : null;
                                })()}
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
            {/* Chart Controls */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* View Type Toggle */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
                  <button
                    onClick={() => setChartViewType('MoM')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      chartViewType === 'MoM'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartViewType('YoY')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      chartViewType === 'YoY'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Yearly
                  </button>
                </div>

                {/* Time Period Selector */}
                <div className="flex gap-1">
                  {(
                    chartViewType === 'MoM'
                      ? ['YTD', '3M', '6M', '1Y', 'ALL']
                      : ['YTD', '1Y', '3Y', '5Y', 'ALL']
                  ).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeFrame(period)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        timeFrame === period
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Net Worth Over Time */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {chartViewType === 'MoM' ? `Net Worth Progression - ${selectedYear}` : `Net Worth Comparison - ${timeFrame}`}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                {chartViewType === 'MoM' ? (
                  <ComposedChart data={prepareNetWorthChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const data = props.payload;
                        let tooltip = [formatCurrency(value), name];

                        // Add percentage growth information
                        if (name === 'Assets' && data.assetGrowth !== null) {
                          const growth = data.assetGrowth >= 0 ? `+${data.assetGrowth.toFixed(1)}%` : `${data.assetGrowth.toFixed(1)}%`;
                          const prevValue = data.prevAssets ? formatCurrency(data.prevAssets) : 'N/A';
                          tooltip[1] = `${name} (${growth} from ${prevValue})`;
                        } else if (name === 'Liabilities' && data.liabilityGrowth !== null) {
                          const growth = data.liabilityGrowth >= 0 ? `+${data.liabilityGrowth.toFixed(1)}%` : `${data.liabilityGrowth.toFixed(1)}%`;
                          const prevValue = data.prevLiabilities ? formatCurrency(data.prevLiabilities) : 'N/A';
                          tooltip[1] = `${name} (${growth} from ${prevValue})`;
                        } else if (name === 'Net Worth' && data.netWorthGrowth !== null) {
                          const growth = data.netWorthGrowth >= 0 ? `+${data.netWorthGrowth.toFixed(1)}%` : `${data.netWorthGrowth.toFixed(1)}%`;
                          const prevValue = data.prevNetWorth ? formatCurrency(data.prevNetWorth) : 'N/A';
                          tooltip[1] = `${name} (${growth} from ${prevValue})`;
                        }

                        return tooltip;
                      }}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        color: 'var(--tooltip-text)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
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
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </ComposedChart>
                ) : (
                  // Year-over-Year Line Chart
                  (() => {
                    const yoyData = prepareYoYChartData();
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

                    // Handle empty data case
                    if (!yoyData || !yoyData.chartData || yoyData.chartData.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-300">
                          <div className="text-center">
                            <p className="mb-2">No multi-year data available</p>
                            <p className="text-sm">Add data to multiple years to see Year-over-Year comparison</p>
                          </div>
                        </div>
                      );
                    }

                    const isMonthlyChart = yoyData.chartType === 'monthly';
                    const xAxisKey = isMonthlyChart ? 'month' : 'year';

                    return (
                      <RechartsLineChart data={yoyData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey={xAxisKey}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                        <Tooltip
                          formatter={(value, name) => {
                            if (isMonthlyChart) {
                              if (typeof name === 'string' && name.startsWith('netWorth_')) {
                                const year = name.replace('netWorth_', '');
                                return [formatCurrency(value), `${year}`];
                              }
                              return [formatCurrency(value), name];
                            } else {
                              return [formatCurrency(value), 'Net Worth'];
                            }
                          }}
                          labelFormatter={(label) => {
                            return isMonthlyChart ? `Month: ${label}` : `Year: ${label}`;
                          }}
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg)',
                            color: 'var(--tooltip-text)',
                            border: '1px solid var(--tooltip-border)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (isMonthlyChart) {
                              if (typeof value === 'string' && value.startsWith('netWorth_')) {
                                return value.replace('netWorth_', '');
                              }
                              return value;
                            } else {
                              return 'Net Worth';
                            }
                          }}
                        />
                        {isMonthlyChart ? (
                          // Monthly chart: multiple year lines
                          (yoyData.years || []).map((year, index) => (
                            <Line
                              key={year}
                              type="monotone"
                              dataKey={`netWorth_${year}`}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                              name={`netWorth_${year}`}
                              dot={{ r: 3 }}
                              connectNulls={false}
                            />
                          ))
                        ) : (
                          // Annual chart: single line showing year progression
                          <Line
                            type="monotone"
                            dataKey="netWorth"
                            stroke={colors[0]}
                            strokeWidth={3}
                            name="netWorth"
                            dot={{ r: 4 }}
                            connectNulls={false}
                          />
                        )}
                      </RechartsLineChart>
                    );
                  })()
                )}
              </ResponsiveContainer>
            </div>

            {/* Two column layout for smaller charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Asset Breakdown */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    {assetChartView === 'summary' ? (
                      <PieChart className="w-5 h-5 text-green-600" />
                    ) : (
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    )}
                    Asset Distribution
                  </h3>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setAssetChartView('summary')}
                      className={`px-3 py-1 text-sm rounded-md transition-all flex items-center gap-1 ${
                        assetChartView === 'summary' 
                          ? 'bg-white dark:bg-gray-950 shadow-sm text-green-600 font-medium' 
                          : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white'
                      }`}
                    >
                      <PieChart className="w-3 h-3" />
                      Summary
                    </button>
                    <button
                      onClick={() => setAssetChartView('detailed')}
                      className={`px-3 py-1 text-sm rounded-md transition-all flex items-center gap-1 ${
                        assetChartView === 'detailed' 
                          ? 'bg-white dark:bg-gray-950 shadow-sm text-green-600 font-medium' 
                          : 'text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-3 h-3" />
                      All Assets
                    </button>
                  </div>
                </div>
                
                {assetChartView === 'summary' ? (
                  // Pie Chart for Summary View
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={getChartData('summary')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          onMouseEnter={(data) => {
                            if (data.isOther) {
                              setShowOtherTooltip(true);
                            }
                          }}
                          onMouseLeave={() => setShowOtherTooltip(false)}
                        >
                          {getChartData('summary').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (props.payload.isOther) {
                              return [formatCurrency(value), `${name} (${props.payload.count} assets)`];
                            }
                            return [formatCurrency(value), name];
                          }}
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg)',
                            color: 'var(--tooltip-text)',
                            border: '1px solid var(--tooltip-border)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                          itemStyle={{ color: 'var(--tooltip-text)' }}
                          labelStyle={{ color: 'var(--tooltip-text)' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    
                    {/* Other Assets Detailed Tooltip */}
                    {showOtherTooltip && summaryData.minorAssets.length > 0 && (
                      <div className="absolute top-4 right-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3 max-w-xs z-10">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 mb-2">Other Assets Breakdown:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {summaryData.minorAssets.map((asset, index) => {
                            const percentage = (asset.value / assetBreakdownData.totalValue) * 100;
                            return (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 truncate mr-2" title={asset.name}>{asset.name}</span>
                                <span className="text-gray-800 dark:text-gray-100 font-medium">{formatCurrency(asset.value)} ({percentage.toFixed(1)}%)</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                          <div className="flex justify-between text-xs font-semibold text-gray-900 dark:text-gray-100">
                            <span>Total Other:</span>
                            <span>{formatCurrency(summaryData.minorAssets.reduce((sum, asset) => sum + asset.value, 0))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // NEW: Custom Horizontal Bar Chart for Asset Values
                  <div className="space-y-4">
                    {getChartData('detailed').map((asset, index) => {
                      const percentage = ((asset.value / assetBreakdownData.totalValue) * 100).toFixed(1);
                      const barWidth = (asset.value / Math.max(...getChartData('detailed').map(a => a.value))) * 100;
                      const color = COLORS[index % COLORS.length];
                      
                      return (
                        <div key={asset.name} className="relative">
                          {/* Asset Name and Value */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{asset.name}</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(asset.value)} ({percentage}%)</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded-lg h-8 overflow-hidden">
                            <div 
                              className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ 
                                width: `${barWidth}%`,
                                backgroundColor: color
                              }}
                            >
                              <span className="text-white text-xs font-medium drop-shadow-sm">
                                {formatCurrencyShort(asset.value)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Summary Stats */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Total Assets:</span>
                        <span className="font-bold text-green-600">{formatCurrency(assetBreakdownData.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Comparison */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Assets vs Liabilities
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareNetWorthChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        color: 'var(--tooltip-text)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                      itemStyle={{ color: 'var(--tooltip-text)' }}
                      labelStyle={{ color: 'var(--tooltip-text)' }}
                      cursor={{ fill: 'rgba(100, 100, 100, 0.2)' }}
                    />
                    <Legend />
                    <Bar dataKey="assets" fill="#10b981" name="Assets" />
                    <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Trend */}
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
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Target className="w-5 h-5 text-orange-600" />
                      Goal Progress
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({finalGoals.length} goals)</span>
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
                            backgroundColor: 'var(--tooltip-bg)',
                            color: 'var(--tooltip-text)',
                            border: '1px solid var(--tooltip-border)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          itemStyle={{ color: 'var(--tooltip-text)' }}
                          labelStyle={{ color: 'var(--tooltip-text)' }}
                          cursor={{ fill: 'rgba(100, 100, 100, 0.2)' }}
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
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Target className="w-5 h-5 text-orange-600" />
                      Goal Progress
                    </h3>
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-300 mb-2">
                        {goals && goals.length > 0 
                          ? 'No valid goals to display' 
                          : 'No financial goals set yet'
                        }
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
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

        {/* Cashflow Tab */}
        {activeTab === 'cashflow' && (
          <CashflowSection
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            cashflowData={cashflowData}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            saveCashflowData={saveCashflowData}
            copyPreviousMonth={copyCashflowPreviousMonth}
            addCategory={addCategory}
            deleteCategory={deleteCategory}
            calculateMetrics={calculateCashflowMetrics}
            formatCurrency={formatCurrency}
            formatCurrencyShort={formatCurrencyShort}
          />
        )}
      </div>

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

      {/* Smart Asset Modal */}
      {showSmartAssetModal && (
        <SmartAssetModal
          isOpen={showSmartAssetModal}
          onClose={() => setShowSmartAssetModal(false)}
          onSave={async (assetData) => {
            // Set the type for the old manual flow if needed
            if (assetData.asset_type === 'manual') {
              setNewAccountType(assetData.type);
            }
            await addApiAsset(assetData);
            reload(); // Reload data to show new asset
          }}
          selectedYear={selectedYear}
          accountType={smartAssetType}
        />
      )}
    </div>
  );
};

export default NetWorthTracker;