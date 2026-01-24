import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { getTrendColors } from '../../utils/accountTrendUtils';

/**
 * TrendIndicator - Displays trend with icon, value change, and percentage
 *
 * @param {number} currentValue - Current value
 * @param {number} previousValue - Previous value for comparison
 * @param {boolean} inverse - If true, flip positive/negative meaning (for liabilities)
 * @param {Function} formatCurrency - Currency formatting function
 * @param {boolean} showPercent - Whether to show percentage
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const TrendIndicator = ({
  currentValue = 0,
  previousValue = 0,
  inverse = false,
  formatCurrency = (v) => `$${v.toLocaleString()}`,
  showPercent = true,
  size = 'sm'
}) => {
  const change = currentValue - previousValue;
  const percentChange = previousValue !== 0
    ? (change / Math.abs(previousValue)) * 100
    : 0;

  const isZeroChange = change === 0;
  const isPositive = change > 0;

  const colors = getTrendColors(isPositive, inverse);

  const sizeClasses = {
    sm: {
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const classes = sizeClasses[size] || sizeClasses.sm;

  // No change
  if (isZeroChange) {
    return (
      <div className={`flex items-center gap-1 ${colors.text}`}>
        <Minus className={classes.icon} />
        <span className={classes.text}>No change</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${colors.text}`}>
      {isPositive ? (
        <ArrowUpRight className={classes.icon} />
      ) : (
        <ArrowDownRight className={classes.icon} />
      )}
      <span className={`${classes.text} font-medium`}>
        {isPositive ? '+' : ''}{formatCurrency(Math.abs(change))}
        {showPercent && (
          <span className="ml-1">
            ({isPositive ? '+' : ''}{Math.abs(percentChange).toFixed(1)}%)
          </span>
        )}
      </span>
    </div>
  );
};

export default TrendIndicator;
