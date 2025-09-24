import { v4 as uuidv4 } from 'uuid';

/**
 * Generate realistic demo financial data
 */
export const generateDemoData = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Generate demo accounts with realistic values
  const assets = [
    {
      id: uuidv4(),
      name: 'Emergency Fund',
      type: 'asset',
      icon: '💰',
      sort_order: 0,
      is_active: true,
      snapshots: generateMonthlySnapshots(15000, 18500, currentMonth)
    },
    {
      id: uuidv4(),
      name: '401(k) Retirement',
      type: 'asset',
      icon: '📈',
      sort_order: 1,
      is_active: true,
      snapshots: generateMonthlySnapshots(45000, 52000, currentMonth)
    },
    {
      id: uuidv4(),
      name: 'Investment Portfolio',
      type: 'asset',
      icon: '📊',
      sort_order: 2,
      is_active: true,
      snapshots: generateMonthlySnapshots(12000, 14500, currentMonth)
    },
    {
      id: uuidv4(),
      name: 'Home Equity',
      type: 'asset',
      icon: '🏠',
      sort_order: 3,
      is_active: true,
      snapshots: generateMonthlySnapshots(85000, 88000, currentMonth)
    },
    {
      id: uuidv4(),
      name: 'Checking Account',
      type: 'asset',
      icon: '🏦',
      sort_order: 4,
      is_active: true,
      snapshots: generateMonthlySnapshots(3200, 4100, currentMonth)
    }
  ];

  const liabilities = [
    {
      id: uuidv4(),
      name: 'Credit Card',
      type: 'liability',
      icon: '💳',
      sort_order: 0,
      is_active: true,
      snapshots: generateMonthlySnapshots(3500, 2800, currentMonth, true)
    },
    {
      id: uuidv4(),
      name: 'Auto Loan',
      type: 'liability',
      icon: '🚗',
      sort_order: 1,
      is_active: true,
      snapshots: generateMonthlySnapshots(18000, 15500, currentMonth, true)
    },
    {
      id: uuidv4(),
      name: 'Mortgage',
      type: 'liability',
      icon: '🏡',
      sort_order: 2,
      is_active: true,
      snapshots: generateMonthlySnapshots(220000, 215000, currentMonth, true)
    }
  ];

  // Generate realistic financial goals
  const goals = [
    {
      id: uuidv4(),
      name: 'Emergency Fund Target',
      target_amount: 25000,
      current_amount: 18500,
      completed: false,
      original_target_amount: 25000,
      original_current_amount: 18500,
      original_currency: 'USD'
    },
    {
      id: uuidv4(),
      name: 'Vacation Fund',
      target_amount: 8000,
      current_amount: 5200,
      completed: false,
      original_target_amount: 8000,
      original_current_amount: 5200,
      original_currency: 'USD'
    },
    {
      id: uuidv4(),
      name: 'Down Payment',
      target_amount: 60000,
      current_amount: 42000,
      completed: false,
      original_target_amount: 60000,
      original_current_amount: 42000,
      original_currency: 'USD'
    },
    {
      id: uuidv4(),
      name: 'Debt Free Goal',
      target_amount: 0,
      current_amount: 18300, // Sum of non-mortgage debt
      completed: false,
      original_target_amount: 0,
      original_current_amount: 18300,
      original_currency: 'USD'
    }
  ];

  // Calculate totals for the year data (reserved for future analytics)
  // const totalAssets = assets.reduce((sum, asset) => {
  //   const latestSnapshot = asset.snapshots[asset.snapshots.length - 1];
  //   return sum + latestSnapshot.value;
  // }, 0);

  // const totalLiabilities = liabilities.reduce((sum, liability) => {
  //   const latestSnapshot = liability.snapshots[liability.snapshots.length - 1];
  //   return sum + latestSnapshot.value;
  // }, 0);

  const yearData = {
    id: uuidv4(),
    year: currentYear,
    annual_goal: 'Increase net worth by 15% and build emergency fund',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Create clean accounts without individual snapshots arrays
  const cleanAssets = assets.map(({ snapshots, ...account }) => account);
  const cleanLiabilities = liabilities.map(({ snapshots, ...account }) => account);

  return {
    yearData,
    accounts: {
      assets: cleanAssets,
      liabilities: cleanLiabilities
    },
    goals,
    snapshots: generateMultiYearSnapshotsObject(assets.concat(liabilities)),
    demoMetadata: {
      isDemo: true,
      createdAt: new Date().toISOString(),
      welcomeMessage: 'Welcome to your demo account! Explore all features freely. Your data will be saved for 7 days.',
      sampleDataNote: 'This account is pre-populated with realistic sample data to help you explore the app.'
    }
  };
};

/**
 * Generate monthly snapshots with realistic progression
 */
function generateMonthlySnapshots(startValue, endValue, currentMonth, isDebt = false) {
  const snapshots = [];
  const currentYear = new Date().getFullYear();
  const monthsToGenerate = Math.min(currentMonth + 1, 12); // Don't generate future months

  for (let month = 0; month < monthsToGenerate; month++) {
    const progress = month / Math.max(currentMonth, 1);
    let value;

    if (isDebt) {
      // Debt should decrease over time
      value = startValue - (startValue - endValue) * progress;
    } else {
      // Assets should increase over time with some variation
      const baseProgress = startValue + (endValue - startValue) * progress;
      const variation = (Math.random() - 0.5) * 0.05 * baseProgress; // ±5% variation
      value = baseProgress + variation;
    }

    // Add some realistic monthly fluctuation
    if (month > 0 && month < currentMonth) {
      const monthlyChange = (Math.random() - 0.5) * 0.02 * value; // ±2% monthly change
      value += monthlyChange;
    }

    snapshots.push({
      id: uuidv4(),
      month,
      year: currentYear,
      value: Math.round(Math.max(value, 0) * 100) / 100, // Round to 2 decimal places, ensure positive
      original_value: Math.round(Math.max(value, 0) * 100) / 100,
      original_currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return snapshots;
}


/**
 * Generate multi-year snapshots for demo data (2023, 2024, 2025)
 */
function generateMultiYearSnapshotsObject(accounts) {
  const snapshotsObj = {};
  const currentYear = new Date().getFullYear();

  // Generate data for the last 3 years (2023, 2024, 2025)
  const yearsToGenerate = [currentYear - 2, currentYear - 1, currentYear];

  accounts.forEach(account => {
    snapshotsObj[account.id] = {};

    yearsToGenerate.forEach(year => {
      // For current year, use the existing snapshot generation
      if (year === currentYear) {
        account.snapshots.forEach(snapshot => {
          const key = `${snapshot.month}-${snapshot.year}`;
          snapshotsObj[account.id][key] = {
            value: snapshot.value,
            original_value: snapshot.original_value,
            original_currency: snapshot.original_currency
          };
        });
      } else {
        // For historical years, generate realistic data
        generateHistoricalSnapshots(account, year, snapshotsObj);
      }
    });
  });

  return snapshotsObj;
}

/**
 * Generate historical snapshots for a specific year
 */
function generateHistoricalSnapshots(account, year, snapshotsObj) {
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - year;

  // Get the latest value from current year snapshots as baseline
  const currentSnapshots = account.snapshots;
  const latestSnapshot = currentSnapshots[currentSnapshots.length - 1];
  const baselineValue = latestSnapshot ? latestSnapshot.value : 0;

  if (baselineValue === 0) return;

  // Calculate historical multiplier based on account type and year difference
  let historicalMultiplier;
  if (account.type === 'asset') {
    // Assets were generally lower in the past (assuming growth)
    historicalMultiplier = Math.max(0.7, 1 - (yearDiff * 0.15));
  } else {
    // Liabilities might have been higher in the past (assuming debt paydown)
    historicalMultiplier = Math.min(1.3, 1 + (yearDiff * 0.1));
  }

  const historicalBaseValue = Math.round(baselineValue * historicalMultiplier);

  // Generate 12 months of data with realistic progression
  for (let month = 0; month < 12; month++) {
    const progress = month / 11; // 0 to 1 throughout the year

    let monthlyValue;
    if (account.type === 'asset') {
      // Assets grow throughout the year with some variation
      const yearlyGrowth = historicalBaseValue * 0.08; // 8% annual growth
      const growthSoFar = yearlyGrowth * progress;
      const monthlyVariation = (Math.random() - 0.5) * 0.03 * historicalBaseValue; // ±3% monthly variation
      monthlyValue = historicalBaseValue + growthSoFar + monthlyVariation;
    } else {
      // Liabilities generally decrease throughout the year (payments)
      const yearlyPaydown = historicalBaseValue * 0.05; // 5% annual paydown
      const paydownSoFar = yearlyPaydown * progress;
      const monthlyVariation = (Math.random() - 0.5) * 0.02 * historicalBaseValue; // ±2% monthly variation
      monthlyValue = historicalBaseValue - paydownSoFar + monthlyVariation;
    }

    // Ensure positive values and round
    monthlyValue = Math.round(Math.max(monthlyValue, 0) * 100) / 100;

    const key = `${month}-${year}`;
    snapshotsObj[account.id][key] = {
      value: monthlyValue,
      original_value: monthlyValue,
      original_currency: 'USD',
      month: month,
      year: year
    };
  }
}

/**
 * Generate sample transaction history (for future use)
 */
export const generateSampleTransactions = () => {
  const transactions = [];
  const categories = [
    { name: 'Salary', type: 'income', icon: '💼' },
    { name: 'Groceries', type: 'expense', icon: '🛒' },
    { name: 'Utilities', type: 'expense', icon: '💡' },
    { name: 'Entertainment', type: 'expense', icon: '🎬' },
    { name: 'Investment', type: 'transfer', icon: '📈' },
    { name: 'Dining Out', type: 'expense', icon: '🍽️' },
    { name: 'Transportation', type: 'expense', icon: '🚗' },
    { name: 'Healthcare', type: 'expense', icon: '🏥' }
  ];

  // Generate 3 months of transaction history
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    
    // Generate 15-25 transactions per month
    const transactionCount = Math.floor(Math.random() * 10) + 15;
    
    for (let i = 0; i < transactionCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const dayOfMonth = Math.floor(Math.random() * 28) + 1;
      const transactionDate = new Date(date.getFullYear(), date.getMonth(), dayOfMonth);
      
      let amount;
      if (category.type === 'income') {
        amount = Math.round((Math.random() * 3000 + 2000) * 100) / 100; // $2000-5000
      } else if (category.type === 'expense') {
        amount = Math.round((Math.random() * 300 + 20) * 100) / 100; // $20-320
      } else {
        amount = Math.round((Math.random() * 1000 + 100) * 100) / 100; // $100-1100
      }
      
      transactions.push({
        id: uuidv4(),
        date: transactionDate.toISOString(),
        description: `${category.name} - ${generateTransactionDescription(category.name)}`,
        amount,
        category: category.name,
        type: category.type,
        icon: category.icon
      });
    }
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Generate realistic transaction descriptions
 */
function generateTransactionDescription(category) {
  const descriptions = {
    'Salary': ['Monthly Salary', 'Paycheck', 'Direct Deposit'],
    'Groceries': ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Target'],
    'Utilities': ['Electric Bill', 'Water Bill', 'Internet', 'Gas Bill'],
    'Entertainment': ['Netflix', 'Movie Tickets', 'Concert', 'Spotify'],
    'Investment': ['401k Contribution', 'Stock Purchase', 'IRA Deposit'],
    'Dining Out': ['Chipotle', 'Local Restaurant', 'Coffee Shop', 'Pizza'],
    'Transportation': ['Gas Station', 'Uber', 'Car Payment', 'Parking'],
    'Healthcare': ['Pharmacy', 'Doctor Visit', 'Dental Cleaning', 'Insurance']
  };
  
  const options = descriptions[category] || ['Transaction'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate helpful tips for demo users
 */
export const getDemoTips = () => {
  return [
    {
      id: 1,
      title: 'Track Your Assets',
      description: 'Add or edit your assets like savings accounts, investments, and property.',
      icon: '💰'
    },
    {
      id: 2,
      title: 'Monitor Liabilities',
      description: 'Keep track of your debts including credit cards, loans, and mortgages.',
      icon: '💳'
    },
    {
      id: 3,
      title: 'Set Financial Goals',
      description: 'Create and track progress towards your financial objectives.',
      icon: '🎯'
    },
    {
      id: 4,
      title: 'Import Data',
      description: 'Use the import feature to quickly add your financial data from CSV files.',
      icon: '📊'
    },
    {
      id: 5,
      title: 'Multi-Currency Support',
      description: 'Switch between 30+ currencies with real-time exchange rates.',
      icon: '💱'
    }
  ];
};