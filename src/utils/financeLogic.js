/**
 * Finance Logic Engine for WealthTrak Financial Health Diagnostic
 * 
 * Provides dual-mode calculations:
 * 1. Health Grade (A-F) based on liquidity, solvency, and savings performance
 * 2. FIRE Plan with Financial Independence number and Freedom Date
 */

// Grade thresholds
const GRADE_THRESHOLDS = {
  A: 90,
  B: 75,
  C: 60,
  D: 45,
  F: 0
};

const HEALTH_TARGETS = {
  runwayMonths: 6,
  savingsRate: 0.2,
  debtToIncomeRatio: 0.3,
  maxDebtToIncomeRatio: 0.6
};

const HEALTH_SCORE_MAX = {
  liquidity: 30,
  solvency: 30,
  savings: 40
};

const ESTIMATED_DEBT_PAYMENT_RATE = 0.01; // 1% of balance if payments are unknown

function resolveMonthlyDebtPayments(monthlyDebtPayments, totalDebt) {
  if (monthlyDebtPayments > 0) return monthlyDebtPayments;
  return Math.max(0, totalDebt * ESTIMATED_DEBT_PAYMENT_RATE);
}

function calculateSolvencyScore(debtToIncomeRatio) {
  if (debtToIncomeRatio <= HEALTH_TARGETS.debtToIncomeRatio) {
    return HEALTH_SCORE_MAX.solvency;
  }
  if (debtToIncomeRatio >= HEALTH_TARGETS.maxDebtToIncomeRatio) {
    return 0;
  }
  const ratioRange = HEALTH_TARGETS.maxDebtToIncomeRatio - HEALTH_TARGETS.debtToIncomeRatio;
  const normalized = (debtToIncomeRatio - HEALTH_TARGETS.debtToIncomeRatio) / ratioRange;
  return HEALTH_SCORE_MAX.solvency * (1 - normalized);
}

/**
 * Calculate the Financial Health Score (0-100)
 * 
 * Scoring breakdown:
 * - Liquidity (30 pts): Months of runway (Cash / Monthly Expenses). Max at 6+ months.
 * - Solvency (30 pts): Monthly debt-to-income ratio (debt payments / income). Lower is better.
 * - Savings Performance (40 pts): Savings Rate %.
 */
export function calculateHealthScore(data) {
  const {
    liquidAssets = 0,      // Cash + Stocks
    totalDebt = 0,         // Total debt balance
    annualIncome = 0,      // Pre-tax household income
    monthlyExpenses = 0,   // Monthly spending
    monthlySavings = 0,    // Monthly savings amount
    monthlyDebtPayments = 0 // Monthly debt payments
  } = data;

  // Avoid division by zero
  const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
  const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
  const resolvedMonthlyDebtPayments = resolveMonthlyDebtPayments(monthlyDebtPayments, totalDebt);

  // 1. Liquidity Score (30 points max)
  // Target: 6 months of expenses in liquid assets
  const monthsOfRunway = liquidAssets / safeMonthlyExpenses;
  const liquidityScore = Math.min(
    HEALTH_SCORE_MAX.liquidity,
    (monthsOfRunway / HEALTH_TARGETS.runwayMonths) * HEALTH_SCORE_MAX.liquidity
  );

  // 2. Solvency Score (30 points max)
  // Debt-to-Income ratio (lower is better)
  // <=30% DTI = 30 points, 60%+ DTI = 0 points
  const rawDebtToIncomeRatio = monthlyIncome > 0
    ? resolvedMonthlyDebtPayments / monthlyIncome
    : (resolvedMonthlyDebtPayments > 0 ? 1 : 0);
  const debtToIncomeRatio = Math.max(0, rawDebtToIncomeRatio);
  const solvencyScore = calculateSolvencyScore(debtToIncomeRatio);

  // 3. Savings Performance Score (40 points max)
  // Target: 20%+ savings rate for max points
  const rawSavingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;
  const savingsRate = Math.max(0, Math.min(1, rawSavingsRate));
  const savingsScore = Math.min(
    HEALTH_SCORE_MAX.savings,
    (savingsRate / HEALTH_TARGETS.savingsRate) * HEALTH_SCORE_MAX.savings
  );

  // Total score
  const totalScore = Math.round(liquidityScore + solvencyScore + savingsScore);

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      liquidity: {
        score: Math.round(liquidityScore * 10) / 10,
        maxScore: HEALTH_SCORE_MAX.liquidity,
        monthsOfRunway: Math.round(monthsOfRunway * 10) / 10,
        targetMonths: HEALTH_TARGETS.runwayMonths
      },
      solvency: {
        score: Math.round(solvencyScore * 10) / 10,
        maxScore: HEALTH_SCORE_MAX.solvency,
        debtToIncomeRatio: Math.round(debtToIncomeRatio * 100),
        targetRatio: Math.round(HEALTH_TARGETS.debtToIncomeRatio * 100)
      },
      savings: {
        score: Math.round(savingsScore * 10) / 10,
        maxScore: HEALTH_SCORE_MAX.savings,
        savingsRate: Math.round(savingsRate * 100),
        targetRate: Math.round(HEALTH_TARGETS.savingsRate * 100)
      }
    }
  };
}

/**
 * Convert numeric score to letter grade
 */
export function scoreToGrade(score) {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade) {
  const colors = {
    A: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-500', hex: '#10B981' },
    B: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', hex: '#22C55E' },
    C: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', hex: '#EAB308' },
    D: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', hex: '#F97316' },
    F: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', hex: '#EF4444' }
  };
  return colors[grade] || colors.F;
}

/**
 * Calculate FIRE (Financial Independence, Retire Early) metrics
 * 
 * Uses the 4% Rule: FI Number = Annual Expenses × 25
 */
export function calculateFIREPlan(data) {
  const {
    liquidAssets = 0,
    realEstateValue = 0,
    totalDebt = 0,
    monthlyExpenses = 0,
    monthlySavings = 0,
    annualReturnRate = 0.07  // Default 7% annual return
  } = data;

  // Calculate current net worth
  const currentNetWorth = liquidAssets + realEstateValue - totalDebt;
  
  // Calculate annual expenses
  const annualExpenses = monthlyExpenses * 12;
  
  // FI Number (4% Rule: need 25x annual expenses)
  const fiNumber = annualExpenses * 25;
  
  // Calculate Freedom Date
  const freedomDateInfo = calculateFreedomDate(
    currentNetWorth,
    monthlySavings,
    fiNumber,
    annualReturnRate
  );

  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.max(0, (currentNetWorth / fiNumber) * 100));

  // Generate wealth trajectory for chart (next 30 years or until FI)
  const trajectoryData = generateWealthTrajectory(
    currentNetWorth,
    monthlySavings,
    fiNumber,
    annualReturnRate,
    Math.min(30, freedomDateInfo.yearsToFI + 5)
  );

  return {
    currentNetWorth,
    fiNumber,
    annualExpenses,
    progressPercentage: Math.round(progressPercentage * 10) / 10,
    freedomDate: freedomDateInfo.date,
    yearsToFI: freedomDateInfo.yearsToFI,
    monthsToFI: freedomDateInfo.monthsToFI,
    isAlreadyFI: currentNetWorth >= fiNumber,
    trajectoryData,
    monthlySavingsNeeded: calculateRequiredMonthlySavings(
      currentNetWorth,
      fiNumber,
      annualReturnRate,
      10 // Target 10 years to FI
    )
  };
}

/**
 * Calculate the date when assets + contributions exceed FI Number
 * Uses compound interest formula with monthly contributions
 */
function calculateFreedomDate(currentAssets, monthlySavings, fiNumber, annualReturnRate) {
  // If already FI
  if (currentAssets >= fiNumber) {
    return {
      date: new Date(),
      yearsToFI: 0,
      monthsToFI: 0
    };
  }

  // If no savings and no growth potential
  if (monthlySavings <= 0 && annualReturnRate <= 0) {
    return {
      date: null,
      yearsToFI: Infinity,
      monthsToFI: Infinity
    };
  }

  const monthlyReturnRate = annualReturnRate / 12;
  let currentValue = currentAssets;
  let months = 0;
  const maxMonths = 600; // Cap at 50 years

  // Simulate month by month
  while (currentValue < fiNumber && months < maxMonths) {
    currentValue = currentValue * (1 + monthlyReturnRate) + monthlySavings;
    months++;
  }

  if (months >= maxMonths) {
    return {
      date: null,
      yearsToFI: 50,
      monthsToFI: 600
    };
  }

  const freedomDate = new Date();
  freedomDate.setMonth(freedomDate.getMonth() + months);

  return {
    date: freedomDate,
    yearsToFI: Math.floor(months / 12),
    monthsToFI: months
  };
}

/**
 * Generate wealth trajectory data for charting
 */
function generateWealthTrajectory(currentAssets, monthlySavings, fiNumber, annualReturnRate, years) {
  const data = [];
  const monthlyReturnRate = annualReturnRate / 12;
  let currentValue = currentAssets;
  const now = new Date();

  // Add starting point
  data.push({
    year: now.getFullYear(),
    month: now.getMonth(),
    label: `${now.getFullYear()}`,
    wealth: Math.round(currentValue),
    fiLine: fiNumber
  });

  // Calculate yearly values
  for (let year = 1; year <= years; year++) {
    // Compound monthly for accuracy
    for (let month = 0; month < 12; month++) {
      currentValue = currentValue * (1 + monthlyReturnRate) + monthlySavings;
    }

    const futureDate = new Date(now);
    futureDate.setFullYear(now.getFullYear() + year);

    data.push({
      year: futureDate.getFullYear(),
      month: futureDate.getMonth(),
      label: `${futureDate.getFullYear()}`,
      wealth: Math.round(currentValue),
      fiLine: fiNumber
    });
  }

  return data;
}

/**
 * Calculate required monthly savings to reach FI in target years
 */
function calculateRequiredMonthlySavings(currentAssets, fiNumber, annualReturnRate, targetYears) {
  if (currentAssets >= fiNumber) return 0;

  const monthlyRate = annualReturnRate / 12;
  const months = targetYears * 12;
  
  // Future value with compound interest
  const futureValueOfCurrent = currentAssets * Math.pow(1 + monthlyRate, months);
  
  // Amount still needed
  const amountNeeded = fiNumber - futureValueOfCurrent;
  
  if (amountNeeded <= 0) return 0;

  // Calculate monthly payment needed (future value of annuity formula, solved for PMT)
  const monthlyPayment = amountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.max(0, Math.round(monthlyPayment));
}

/**
 * Generate personalized "Quick Wins" based on financial data
 */
export function generateQuickWins(data, healthScore) {
  const {
    liquidAssets = 0,
    totalDebt = 0,
    annualIncome = 0,
    monthlyExpenses = 0,
    monthlySavings = 0,
    monthlyDebtPayments = 0
  } = data;

  const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
  const resolvedMonthlyDebtPayments = resolveMonthlyDebtPayments(monthlyDebtPayments, totalDebt);
  const { breakdown } = healthScore;
  const wins = [];
  const targetDtiPercent = Math.round(HEALTH_TARGETS.debtToIncomeRatio * 100);

  // Liquidity recommendations
  if (breakdown.liquidity.monthsOfRunway < HEALTH_TARGETS.runwayMonths) {
    const targetEmergencyFund = monthlyExpenses * HEALTH_TARGETS.runwayMonths;
    const amountNeeded = Math.max(0, targetEmergencyFund - liquidAssets);
    if (amountNeeded > 0) {
      wins.push({
        priority: 1,
        category: 'liquidity',
        icon: 'Shield',
        title: 'Build Emergency Fund',
        description: `Add $${formatNumber(amountNeeded)} to reach ${HEALTH_TARGETS.runwayMonths} months of expenses`,
        impact: 'High',
        gradeImpact: calculateGradeImpactForLiquidity(amountNeeded, monthlyExpenses, breakdown.liquidity.score)
      });
    }
  }

  // Debt recommendations
  if (breakdown.solvency.debtToIncomeRatio > targetDtiPercent) {
    const targetPayment = monthlyIncome * HEALTH_TARGETS.debtToIncomeRatio;
    const paymentReduction = Math.max(0, resolvedMonthlyDebtPayments - targetPayment);
    wins.push({
      priority: 2,
      category: 'solvency',
      icon: 'TrendingDown',
      title: 'Lower Debt Payments',
      description: `Reduce payments by $${formatNumber(paymentReduction)}/month to reach a ${targetDtiPercent}% DTI`,
      impact: 'High',
      gradeImpact: calculateGradeImpactForSolvency(resolvedMonthlyDebtPayments, annualIncome, breakdown.solvency.score)
    });
  }

  // Savings rate recommendations
  const currentSavingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;
  
  if (monthlyIncome > 0 && currentSavingsRate < HEALTH_TARGETS.savingsRate) {
    const targetSavings = monthlyIncome * HEALTH_TARGETS.savingsRate;
    const additionalSavings = Math.max(0, targetSavings - monthlySavings);
    wins.push({
      priority: 3,
      category: 'savings',
      icon: 'PiggyBank',
      title: 'Boost Savings Rate',
      description: `Save an extra $${formatNumber(additionalSavings)}/month to reach ${Math.round(HEALTH_TARGETS.savingsRate * 100)}% savings rate`,
      impact: 'Medium',
      gradeImpact: calculateGradeImpactForSavings(monthlySavings, annualIncome, breakdown.savings.score)
    });
  }

  // Investment diversification (if heavy on cash)
  if (liquidAssets > monthlyExpenses * (HEALTH_TARGETS.runwayMonths * 2)) {
    const excessCash = liquidAssets - (monthlyExpenses * HEALTH_TARGETS.runwayMonths);
    if (excessCash > 5000) {
      wins.push({
        priority: 4,
        category: 'growth',
        icon: 'TrendingUp',
        title: 'Put Cash to Work',
        description: `Consider investing $${formatNumber(excessCash)} excess cash for long-term growth`,
        impact: 'Medium',
        gradeImpact: 'Improves FIRE timeline'
      });
    }
  }

  // If already doing well, provide maintenance tips
  if (wins.length === 0) {
    wins.push({
      priority: 1,
      category: 'maintenance',
      icon: 'Award',
      title: 'Stay the Course',
      description: 'Your finances are in excellent shape! Keep up your current habits.',
      impact: 'Positive',
      gradeImpact: 'Maintain A grade'
    });
  }

  // Sort by priority and return top 3
  return wins.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

/**
 * Calculate how much a liquidity improvement would affect the grade
 */
function calculateGradeImpactForLiquidity(amountToAdd, monthlyExpenses, currentScore) {
  const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
  const newMonthsOfRunway = (amountToAdd / safeMonthlyExpenses) + (currentScore / HEALTH_SCORE_MAX.liquidity * HEALTH_TARGETS.runwayMonths);
  const newScore = Math.min(
    HEALTH_SCORE_MAX.liquidity,
    (newMonthsOfRunway / HEALTH_TARGETS.runwayMonths) * HEALTH_SCORE_MAX.liquidity
  );
  const pointsGained = Math.round(newScore - currentScore);
  return `+ ${pointsGained} points`;
}

function calculateGradeImpactForSolvency(_monthlyDebtPayments, annualIncome, currentScore) {
  const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
  if (monthlyIncome <= 0) return '+ 0 points';
  const targetRatio = HEALTH_TARGETS.debtToIncomeRatio;
  const newScore = calculateSolvencyScore(targetRatio);
  const pointsGained = Math.max(0, Math.round(newScore - currentScore));
  return `+ ${pointsGained} points`;
}

function calculateGradeImpactForSavings(monthlySavings, annualIncome, currentScore) {
  const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
  if (monthlyIncome <= 0) return '+ 0 points';
  const targetSavings = monthlyIncome * HEALTH_TARGETS.savingsRate;
  if (monthlySavings >= targetSavings) return '+ 0 points';
  const newScore = HEALTH_SCORE_MAX.savings;
  const pointsGained = Math.max(0, Math.round(newScore - currentScore));
  return `+ ${pointsGained} points`;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format currency with proper symbol
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Generate shareable score summary
 */
export function generateShareableScore(grade, score, freedomDate) {
  const freedomText = freedomDate 
    ? `Freedom Date: ${freedomDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : 'Still calculating my path to FI';
  
  return `🏆 My WealthTrak Financial Health Score: ${grade} (${score}/100)

📈 ${freedomText}

Take your free assessment at wealthtrak.xyz

#FinancialHealth #FIRE #WealthTrak`;
}

/**
 * Validate input data
 */
export function validateInputs(data) {
  const errors = {};
  
  if (data.age !== undefined && (data.age < 18 || data.age > 100)) {
    errors.age = 'Age must be between 18 and 100';
  }
  
  if (data.annualIncome !== undefined && data.annualIncome < 0) {
    errors.annualIncome = 'Income cannot be negative';
  }
  
  if (data.liquidAssets !== undefined && data.liquidAssets < 0) {
    errors.liquidAssets = 'Assets cannot be negative';
  }

  if (data.totalDebt !== undefined && data.totalDebt < 0) {
    errors.totalDebt = 'Debt cannot be negative';
  }
  
  if (data.monthlyExpenses !== undefined && data.monthlyExpenses < 0) {
    errors.monthlyExpenses = 'Expenses cannot be negative';
  }
  
  if (data.monthlyDebtPayments !== undefined && data.monthlyDebtPayments < 0) {
    errors.monthlyDebtPayments = 'Debt payments cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

const financeLogic = {
  calculateHealthScore,
  scoreToGrade,
  getGradeColor,
  calculateFIREPlan,
  generateQuickWins,
  formatNumber,
  formatCurrency,
  generateShareableScore,
  validateInputs
};

export default financeLogic;
