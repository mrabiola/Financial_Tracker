import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * Mobile-optimized category card with progress bar
 * Inspired by Monarch Money's budget cards
 */
const MobileCategoryCard = ({
  icon,
  name,
  spent,
  budget,
  color = 'blue',
  onClick,
  formatCurrency,
  showBudget = true,
  type = 'expense' // 'expense' | 'income'
}) => {
  // Calculate progress percentage
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  
  // Determine progress bar color based on spending health
  const getProgressColor = () => {
    if (type === 'income') return 'bg-green-500';
    if (!showBudget || budget === 0) return 'bg-blue-500';
    if (overBudget) return 'bg-red-500';
    if (progress > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Color variants for the card accent
  const colorVariants = {
    green: 'border-l-green-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
    yellow: 'border-l-yellow-500',
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-900 
        rounded-xl shadow-sm 
        border border-gray-200 dark:border-gray-800
        border-l-4 ${colorVariants[color] || colorVariants.blue}
        p-4 
        cursor-pointer 
        active:bg-gray-50 dark:active:bg-gray-800
        transition-colors
      `}
    >
      {/* Header row: Icon, Name, Amount */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 text-base">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${showBudget && budget > 0 ? progress : (spent > 0 ? 100 : 0)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getProgressColor()}`}
        />
      </div>

      {/* Footer row: Spent / Budget */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${overBudget ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
          {formatCurrency ? formatCurrency(spent) : `$${spent.toLocaleString()}`}
        </span>
        {showBudget && budget > 0 ? (
          <span className="text-gray-500 dark:text-gray-400">
            {formatCurrency ? formatCurrency(budget) : `$${budget.toLocaleString()}`}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {type === 'income' ? 'earned' : 'spent'}
          </span>
        )}
      </div>

      {/* Over budget warning */}
      {overBudget && (
        <div className="mt-2 text-xs text-red-600 font-medium">
          Over by {formatCurrency ? formatCurrency(spent - budget) : `$${(spent - budget).toLocaleString()}`}
        </div>
      )}
    </motion.div>
  );
};

export default MobileCategoryCard;
