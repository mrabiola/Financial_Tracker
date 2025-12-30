import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  DollarSign,
  CreditCard,
  PiggyBank,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  TrendingUp,
  TrendingDown,
  Shield,
  Share2,
  ArrowRight,
  Sparkles,
  Target,
  Calendar,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import {
  calculateHealthScore,
  scoreToGrade,
  getGradeColor,
  calculateFIREPlan,
  generateQuickWins,
  formatNumber,
  formatCurrency,
  generateShareableScore
} from '../../utils/financeLogic';

// Step configuration
const STEPS = [
  {
    id: 'demographics',
    title: 'About You',
    subtitle: 'Help us personalize your assessment',
    icon: User
  },
  {
    id: 'assets',
    title: 'Your Assets',
    subtitle: 'What you own',
    icon: DollarSign
  },
  {
    id: 'liabilities',
    title: 'Your Debts',
    subtitle: 'What you owe',
    icon: CreditCard
  },
  {
    id: 'lifestyle',
    title: 'Cash Flow',
    subtitle: 'Monthly money movement',
    icon: PiggyBank
  }
];

const SLIDER_TARGET_STEPS = 200;

const getNiceMax = (value, baseMax) => {
  if (value <= baseMax) return baseMax;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return magnitude * 2;
  if (normalized <= 5) return magnitude * 5;
  return magnitude * 10;
};

// Input component with slider and manual entry
const CurrencyInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000000,
  step = 1000,
  hardMax = Number.MAX_SAFE_INTEGER,
  tooltip
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [sliderMax, setSliderMax] = useState(max);

  useEffect(() => {
    const nextMax = value > max ? getNiceMax(value, max) : max;
    if (nextMax !== sliderMax) {
      setSliderMax(nextMax);
    }
  }, [value, max, sliderMax]);

  const sliderStep = Math.max(step, Math.round(sliderMax / SLIDER_TARGET_STEPS));
  const safeRange = Math.max(sliderMax - min, 1);
  const sliderValue = Math.min(Math.max(value, min), sliderMax);
  const sliderPercent = ((sliderValue - min) / safeRange) * 100;

  const handleSliderChange = (e) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue.replace(/[^0-9.-]+/g, '')) || 0;
    onChange(Math.max(min, Math.min(hardMax, numValue)));
    setIsEditing(false);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(value.toString());
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {tooltip && (
            <span className="group relative">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {tooltip}
              </span>
            </span>
          )}
        </label>
        <div className="relative">
          {isEditing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              autoFocus
              className="w-32 text-right font-semibold text-gray-900 border border-blue-500 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          ) : (
            <button
              onClick={handleInputFocus}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {formatCurrency(value)}
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={sliderMax}
        step={sliderStep}
        value={sliderValue}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #4F85FF 0%, #4F85FF ${sliderPercent}%, #E5E7EB ${sliderPercent}%, #E5E7EB 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(sliderMax)}+</span>
      </div>
    </div>
  );
};

// Age input component
const AgeInput = ({ value, onChange }) => {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-gray-700 block mb-2">
        Your Age
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={18}
          max={80}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #4F85FF 0%, #4F85FF ${(value - 18) / (80 - 18) * 100}%, #E5E7EB ${(value - 18) / (80 - 18) * 100}%, #E5E7EB 100%)`
          }}
        />
        <div className="w-16 text-center">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500 block">years</span>
        </div>
      </div>
    </div>
  );
};

// Progress indicator
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index < currentStep
                ? 'bg-emerald-500 text-white'
                : index === currentStep
                ? 'bg-blue-500 text-white scale-110'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${
                index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Quick Win Card
const QuickWinCard = ({ win, index }) => {
  const iconMap = {
    Shield: Shield,
    TrendingDown: TrendingDown,
    TrendingUp: TrendingUp,
    PiggyBank: PiggyBank,
    Award: Award
  };
  const IconComponent = iconMap[win.icon] || Target;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
    >
      <div className="p-2 bg-blue-100 rounded-lg">
        <IconComponent className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{win.title}</h4>
        <p className="text-sm text-gray-600">{win.description}</p>
        <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {win.gradeImpact}
        </span>
      </div>
    </motion.div>
  );
};

// Custom tooltip for chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{payload[0]?.payload?.label}</p>
        <p className="text-sm text-blue-600">
          Net Worth: {formatCurrency(payload[0]?.value || 0)}
        </p>
        <p className="text-sm text-emerald-600">
          FI Target: {formatCurrency(payload[0]?.payload?.fiLine || 0)}
        </p>
      </div>
    );
  }
  return null;
};

// Main Wizard Component
const FinancialHealthWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resultView, setResultView] = useState('health'); // 'health' or 'fire'
  const [copied, setCopied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    age: 30,
    annualIncome: 75000,
    liquidAssets: 25000,
    realEstateValue: 0,
    totalDebt: 15000,
    monthlyDebtPayments: 0,
    monthlyExpenses: 4000,
    monthlySavings: 1000
  });

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCopyScore = async () => {
    const healthScore = calculateHealthScore(formData);
    const firePlan = calculateFIREPlan(formData);
    const grade = scoreToGrade(healthScore.totalScore);
    const shareText = generateShareableScore(grade, healthScore.totalScore, firePlan.freedomDate);
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSaveReport = () => {
    const healthScore = calculateHealthScore(formData);
    const firePlan = calculateFIREPlan(formData);
    const grade = scoreToGrade(healthScore.totalScore);
    const freedomDate = firePlan.freedomDate ? firePlan.freedomDate.toISOString() : null;
    const annualSavings = Math.max(0, formData.monthlySavings * 12);
    const projectedNetWorth = firePlan.currentNetWorth + annualSavings;

    // Store results in sessionStorage for potential use after signup
    sessionStorage.setItem('healthDiagnosticResults', JSON.stringify({
      formData,
      grade,
      healthScore,
      freedomDate,
      summary: {
        grade,
        totalScore: healthScore.totalScore,
        currentNetWorth: firePlan.currentNetWorth,
        annualSavings,
        projectedNetWorth,
        freedomDate,
        monthsOfRunway: healthScore.breakdown.liquidity.monthsOfRunway,
        savingsRate: healthScore.breakdown.savings.savingsRate,
        debtToIncomeRatio: healthScore.breakdown.solvency.debtToIncomeRatio
      },
      timestamp: new Date().toISOString()
    }));
    navigate('/signup?source=diagnostic');
  };

  // Calculate results
  const healthScore = calculateHealthScore(formData);
  const firePlan = calculateFIREPlan(formData);
  const grade = scoreToGrade(healthScore.totalScore);
  const gradeColors = getGradeColor(grade);
  const quickWins = generateQuickWins(formData, healthScore);
  const annualSavings = Math.max(0, formData.monthlySavings * 12);
  const projectedNetWorth = firePlan.currentNetWorth + annualSavings;

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  // Render step content
  const renderStepContent = () => {
    const StepIcon = STEPS[currentStep].icon;

    return (
      <motion.div
        key={currentStep}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <StepIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-gray-600">{STEPS[currentStep].subtitle}</p>
        </div>

        {currentStep === 0 && (
          <>
            <AgeInput
              value={formData.age}
              onChange={(v) => updateField('age', v)}
            />
            <CurrencyInput
              label="Annual Pre-tax Household Income"
              value={formData.annualIncome}
              onChange={(v) => updateField('annualIncome', v)}
              min={0}
              max={1000000}
              hardMax={100000000}
              step={5000}
              tooltip="Your total household income before taxes"
            />
          </>
        )}

        {currentStep === 1 && (
          <>
            <CurrencyInput
              label="Liquid Assets"
              value={formData.liquidAssets}
              onChange={(v) => updateField('liquidAssets', v)}
              min={0}
              max={2000000}
              hardMax={100000000}
              step={5000}
              tooltip="Cash, savings, stocks, bonds, crypto"
            />
            <CurrencyInput
              label="Real Estate Value"
              value={formData.realEstateValue}
              onChange={(v) => updateField('realEstateValue', v)}
              min={0}
              max={5000000}
              hardMax={200000000}
              step={10000}
              tooltip="Current market value of properties you own"
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <CurrencyInput
              label="Total Debt"
              value={formData.totalDebt}
              onChange={(v) => updateField('totalDebt', v)}
              min={0}
              max={2000000}
              hardMax={100000000}
              step={5000}
              tooltip="Credit cards, mortgages, student loans, car loans"
            />
            <CurrencyInput
              label="Monthly Debt Payments"
              value={formData.monthlyDebtPayments}
              onChange={(v) => updateField('monthlyDebtPayments', v)}
              min={0}
              max={20000}
              hardMax={500000}
              step={100}
              tooltip="Minimum monthly debt payments (mortgage, loans, cards). If unsure, leave it blank and we'll estimate."
            />
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Include all debts — mortgage balance, car loans, student loans, and credit cards.
                <span className="block mt-1 text-xs text-amber-700">
                  We estimate payments at ~1% of balance if you leave them blank.
                </span>
              </p>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CurrencyInput
              label="Monthly Expenses"
              value={formData.monthlyExpenses}
              onChange={(v) => updateField('monthlyExpenses', v)}
              min={0}
              max={30000}
              hardMax={500000}
              step={250}
              tooltip="All monthly spending including housing, food, transport, and debt"
            />
            <CurrencyInput
              label="Monthly Savings"
              value={formData.monthlySavings}
              onChange={(v) => updateField('monthlySavings', v)}
              min={0}
              max={50000}
              hardMax={500000}
              step={100}
              tooltip="Amount you save or invest each month"
            />
          </>
        )}
        <p className="text-center text-xs text-gray-400">
          Tip: click any amount to type a custom value; ranges expand for larger numbers.
        </p>
      </motion.div>
    );
  };

  // Render results
  const renderResults = () => {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setResultView('health')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                resultView === 'health'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Health Grade
            </button>
            <button
              onClick={() => setResultView('fire')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                resultView === 'fire'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Independence Plan
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {resultView === 'health' ? (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Grade Card */}
              <div className={`text-center p-8 rounded-2xl ${gradeColors.bg} border-2 ${gradeColors.border} mb-6`}>
                <p className="text-sm font-medium text-gray-600 mb-2">Your Financial Health Grade</p>
                <div className={`text-8xl font-bold ${gradeColors.text} mb-2`}>
                  {grade}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: gradeColors.hex }}
                      initial={{ width: 0 }}
                      animate={{ width: `${healthScore.totalScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {healthScore.totalScore}/100
                  </span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Shield className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Liquidity</p>
                  <p className="text-lg font-bold text-gray-900">
                    {healthScore.breakdown.liquidity.score}/{healthScore.breakdown.liquidity.maxScore}
                  </p>
                  <p className="text-xs text-gray-400">
                    {healthScore.breakdown.liquidity.monthsOfRunway} mo. runway
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <TrendingDown className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Solvency</p>
                  <p className="text-lg font-bold text-gray-900">
                    {healthScore.breakdown.solvency.score}/{healthScore.breakdown.solvency.maxScore}
                  </p>
                  <p className="text-xs text-gray-400">
                    {healthScore.breakdown.solvency.debtToIncomeRatio}% DTI
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <PiggyBank className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Savings</p>
                  <p className="text-lg font-bold text-gray-900">
                    {healthScore.breakdown.savings.score}/{healthScore.breakdown.savings.maxScore}
                  </p>
                  <p className="text-xs text-gray-400">
                    {healthScore.breakdown.savings.savingsRate}% rate
                  </p>
                </div>
              </div>

              {/* Quick Wins */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Your Quick Wins
                </h3>
                <div className="space-y-3">
                  {quickWins.map((win, index) => (
                    <QuickWinCard key={index} win={win} index={index} />
                  ))}
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleCopyScore}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-500" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" />
                    Share Your Score
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="fire"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Freedom Date Card */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-6">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-80" />
                <p className="text-sm font-medium opacity-80 mb-2">Your Freedom Date</p>
                {firePlan.isAlreadyFI ? (
                  <div className="text-3xl font-bold mb-2">
                    🎉 You're Already FI!
                  </div>
                ) : firePlan.freedomDate ? (
                  <div className="text-3xl font-bold mb-2">
                    {firePlan.freedomDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                ) : (
                  <div className="text-2xl font-bold mb-2">
                    50+ years away
                  </div>
                )}
                <p className="text-sm opacity-80">
                  {firePlan.isAlreadyFI 
                    ? 'Congratulations! You\'ve reached financial independence.'
                    : `${firePlan.yearsToFI} years and ${firePlan.monthsToFI % 12} months to go`
                  }
                </p>
              </div>

              {/* FI Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">FI Number (4% Rule)</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(firePlan.fiNumber)}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Current Net Worth</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(firePlan.currentNetWorth)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress to FI</span>
                  <span className="font-semibold text-gray-900">
                    {firePlan.progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, firePlan.progressPercentage)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Wealth Trajectory Chart */}
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Wealth Trajectory vs. Freedom Line
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={firePlan.trajectoryData}>
                      <defs>
                        <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F85FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4F85FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="label" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine
                        y={firePlan.fiNumber}
                        stroke="#10B981"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                          value: 'FI Target',
                          position: 'right',
                          fill: '#10B981',
                          fontSize: 12
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="wealth"
                        stroke="#4F85FF"
                        strokeWidth={3}
                        fill="url(#wealthGradient)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Savings Tip */}
              {!firePlan.isAlreadyFI && firePlan.monthlySavingsNeeded > formData.monthlySavings && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Speed it up:</strong> Save {formatCurrency(firePlan.monthlySavingsNeeded)}/month 
                    to reach FI in 10 years.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Save this report to unlock
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Baseline snapshot</p>
                <p className="text-xs text-gray-600">
                  Grade {grade} • Net worth {formatCurrency(firePlan.currentNetWorth)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <PiggyBank className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Savings power</p>
                <p className="text-xs text-gray-600">
                  {formatCurrency(annualSavings)}/year at your current pace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">12-month projection</p>
                <p className="text-xs text-gray-600">
                  Projected net worth {formatCurrency(projectedNetWorth)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Report CTA */}
        <motion.button
          onClick={handleSaveReport}
          className="w-full flex items-center justify-center gap-2 py-4 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          style={{ backgroundColor: '#4F85FF' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Report & Start My Timeline
          <ArrowRight className="h-5 w-5" />
        </motion.button>
        <p className="text-center text-sm text-gray-500">
          Create a free account to save your baseline and track your grade over time
        </p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 && !showResults}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              currentStep === 0 && !showResults
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <span className="text-sm text-gray-500">
            {showResults ? 'Your Results' : `Step ${currentStep + 1} of ${STEPS.length}`}
          </span>
          <button
            onClick={() => navigate('/welcome')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {!showResults && (
          <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />
        )}

        <AnimatePresence mode="wait">
          {showResults ? renderResults() : renderStepContent()}
        </AnimatePresence>

        {/* Navigation Buttons (only in wizard mode) */}
        {!showResults && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-4 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#4F85FF' }}
            >
              {currentStep === STEPS.length - 1 ? (
                <>
                  See My Results
                  <Sparkles className="h-5 w-5" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FinancialHealthWizard;
