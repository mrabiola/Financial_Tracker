import React, { useEffect, useMemo, useState } from 'react';
import { Award, Bell, Calendar, X } from 'lucide-react';

const reminderOptions = [
  { value: 'monthly', label: 'Monthly check-in' },
  { value: 'quarterly', label: 'Quarterly check-in' },
  { value: 'yearly', label: 'Yearly check-in' },
  { value: 'off', label: 'No reminders' }
];

const DiagnosticBaselineModal = ({
  isOpen,
  baseline,
  onConfirm,
  onSkip,
  isSaving,
  error
}) => {
  const [frequency, setFrequency] = useState('quarterly');

  useEffect(() => {
    if (isOpen) {
      setFrequency('quarterly');
    }
  }, [isOpen]);

  const summary = useMemo(() => {
    if (!baseline?.healthScore) return null;
    const { breakdown, totalScore } = baseline.healthScore;
    return {
      grade: baseline.grade,
      totalScore,
      monthsOfRunway: breakdown?.liquidity?.monthsOfRunway,
      savingsRate: breakdown?.savings?.savingsRate,
      debtToIncomeRatio: breakdown?.solvency?.debtToIncomeRatio,
      capturedAt: baseline.timestamp ? new Date(baseline.timestamp).toLocaleDateString() : null
    };
  }, [baseline]);

  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onSkip}
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-800">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm your diagnostic baseline
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save this score so we can track your progress over time.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Financial Health</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {summary.capturedAt ? `Captured ${summary.capturedAt}` : 'Captured today'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {summary.grade}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{summary.totalScore}/100 score</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 text-right">
                <div>{summary.monthsOfRunway} mo runway</div>
                <div>{summary.savingsRate}% savings</div>
                <div>{summary.debtToIncomeRatio}% DTI</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-blue-500" />
              Diagnostic reminders
            </label>
            <div className="flex items-center gap-3">
              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {reminderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Scheduled
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onConfirm(frequency === 'off' ? null : frequency)}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save baseline'}
            </button>
            <button
              onClick={onSkip}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticBaselineModal;
