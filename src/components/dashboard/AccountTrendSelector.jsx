import React from 'react';

/**
 * AccountTrendSelector - Period selector buttons for trend display
 *
 * @param {string} selectedPeriod - Currently selected period
 * @param {Function} onSelect - Callback when period is selected
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const AccountTrendSelector = ({
  selectedPeriod = '6M',
  onSelect = () => {},
  size = 'sm'
}) => {
  const periods = [
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: 'YTD', label: 'YTD' },
    { value: '1Y', label: '1Y' }
  ];

  const sizeClasses = {
    sm: {
      button: 'px-2.5 py-1 text-xs',
      container: 'gap-1'
    },
    md: {
      button: 'px-3 py-1.5 text-sm',
      container: 'gap-1.5'
    },
    lg: {
      button: 'px-4 py-2 text-base',
      container: 'gap-2'
    }
  };

  const classes = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`flex items-center ${classes.container}`}>
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onSelect(period.value)}
          className={`
            ${classes.button}
            font-medium rounded-md transition-all duration-150
            ${selectedPeriod === period.value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default AccountTrendSelector;
