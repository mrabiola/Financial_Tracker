const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Calculate account value history for a specific period
 * @param {string} accountId - Account ID
 * @param {Function} getSnapshotValue - Function to get snapshot value
 * @param {number} selectedMonth - Currently selected month (0-11)
 * @param {string} period - Period: '3M', '6M', 'YTD', '1Y'
 * @returns {Array} - Array of { month, value, monthIndex }
 */
export function getAccountHistory(accountId, getSnapshotValue, selectedMonth, period) {
  const history = [];
  let monthsToInclude = 0;

  // Determine how many months to include
  switch (period) {
    case '3M':
      monthsToInclude = 3;
      break;
    case '6M':
      monthsToInclude = 6;
      break;
    case 'YTD':
      monthsToInclude = selectedMonth + 1;
      break;
    case '1Y':
    default:
      monthsToInclude = 12;
      break;
  }

  // Limit to maximum of 12 months
  monthsToInclude = Math.min(monthsToInclude, 12);
  // Ensure at least 1 month
  monthsToInclude = Math.max(monthsToInclude, 1);

  // Build history array
  for (let i = monthsToInclude - 1; i >= 0; i--) {
    let monthIdx = selectedMonth - i;

    // Handle wrap-around for previous year
    if (monthIdx < 0) {
      monthIdx += 12;
    }

    history.push({
      month: MONTHS[monthIdx],
      monthIndex: monthIdx,
      value: getSnapshotValue(accountId, monthIdx)
    });
  }

  return history;
}

/**
 * Calculate percentage change between two values
 * @param {number} currentValue - Current value
 * @param {number} previousValue - Previous value
 * @returns {number} - Percentage change
 */
export function calculatePercentChange(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) {
    return 0;
  }
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

/**
 * Calculate absolute change between two values
 * @param {number} currentValue - Current value
 * @param {number} previousValue - Previous value
 * @returns {number} - Absolute change
 */
export function calculateAbsoluteChange(currentValue, previousValue) {
  return currentValue - previousValue;
}

/**
 * Get comprehensive trend data for an account
 * @param {string} accountId - Account ID
 * @param {Function} getSnapshotValue - Function to get snapshot value
 * @param {number} selectedMonth - Currently selected month (0-11)
 * @param {string} period - Period: '3M', '6M', 'YTD', '1Y'
 * @returns {Object} - Trend data object
 */
export function getTrendData(accountId, getSnapshotValue, selectedMonth, period) {
  const history = getAccountHistory(accountId, getSnapshotValue, selectedMonth, period);

  if (history.length === 0) {
    return {
      history: [],
      currentValue: 0,
      previousValue: 0,
      change: 0,
      percentChange: 0,
      isPositive: false,
      isZeroChange: true,
      period
    };
  }

  const currentValue = history[history.length - 1].value;
  const previousValue = history[0].value;

  const change = calculateAbsoluteChange(currentValue, previousValue);
  const percentChange = calculatePercentChange(currentValue, previousValue);

  return {
    history,
    currentValue,
    previousValue,
    change,
    percentChange,
    isPositive: change > 0,
    isZeroChange: change === 0,
    period
  };
}

/**
 * Get month-over-month trend for a specific account
 * @param {string} accountId - Account ID
 * @param {Function} getSnapshotValue - Function to get snapshot value
 * @param {number} selectedMonth - Currently selected month (0-11)
 * @returns {Object} - MoM trend data
 */
export function getMonthOverMonthTrend(accountId, getSnapshotValue, selectedMonth) {
  const currentValue = getSnapshotValue(accountId, selectedMonth);

  let prevMonthIdx = selectedMonth - 1;
  if (prevMonthIdx < 0) prevMonthIdx = 11;

  const previousValue = getSnapshotValue(accountId, prevMonthIdx);

  const change = calculateAbsoluteChange(currentValue, previousValue);
  const percentChange = calculatePercentChange(currentValue, previousValue);

  return {
    currentValue,
    previousValue,
    change,
    percentChange,
    isPositive: change > 0,
    isZeroChange: change === 0
  };
}

/**
 * Get YTD (Year-to-Date) trend for a specific account
 * @param {string} accountId - Account ID
 * @param {Function} getSnapshotValue - Function to get snapshot value
 * @param {number} selectedMonth - Currently selected month (0-11)
 * @returns {Object} - YTD trend data
 */
export function getYtdTrend(accountId, getSnapshotValue, selectedMonth) {
  return getTrendData(accountId, getSnapshotValue, selectedMonth, 'YTD');
}

/**
 * Format trend value for display
 * @param {number} value - Trend value
 * @param {boolean} isPositive - Whether the trend is positive
 * @param {boolean} inverse - If true, flip the positive/negative meaning (for liabilities)
 * @returns {string} - Formatted trend string
 */
export function formatTrendValue(value, isPositive, inverse = false) {
  const effectivePositive = inverse ? !isPositive : isPositive;

  if (value === 0) {
    return 'No change';
  }

  const sign = effectivePositive ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get trend color classes based on direction
 * @param {boolean} isPositive - Whether the trend is positive
 * @param {boolean} inverse - If true, flip the positive/negative meaning
 * @returns {Object} - Color classes for text and background
 */
export function getTrendColors(isPositive, inverse = false) {
  const effectivePositive = inverse ? !isPositive : isPositive;

  if (isPositive === false && !inverse) {
    // Negative change (bad)
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100 dark:bg-red-900/30'
    };
  }

  if (effectivePositive) {
    // Positive change (good)
    return {
      text: 'text-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100 dark:bg-green-900/30'
    };
  }

  // Neutral
  return {
    text: 'text-gray-500',
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-100 dark:bg-gray-900/30'
  };
}

/**
 * Calculate all period trends at once for efficiency
 * @param {string} accountId - Account ID
 * @param {Function} getSnapshotValue - Function to get snapshot value
 * @param {number} selectedMonth - Currently selected month (0-11)
 * @returns {Object} - Object with trends for all periods
 */
export function getAllPeriodTrends(accountId, getSnapshotValue, selectedMonth) {
  return {
    mom: getMonthOverMonthTrend(accountId, getSnapshotValue, selectedMonth),
    '3M': getTrendData(accountId, getSnapshotValue, selectedMonth, '3M'),
    '6M': getTrendData(accountId, getSnapshotValue, selectedMonth, '6M'),
    YTD: getYtdTrend(accountId, getSnapshotValue, selectedMonth),
    '1Y': getTrendData(accountId, getSnapshotValue, selectedMonth, '1Y')
  };
}
