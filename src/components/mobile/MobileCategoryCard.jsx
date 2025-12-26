import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';

/**
 * Mobile-optimized category card with progress bar and expandable actions
 * Inspired by Monarch Money's budget cards
 */
const MobileCategoryCard = ({
  icon,
  name,
  spent,
  budget,
  color = 'blue',
  onClick,
  onDelete,
  onRequestDelete,
  formatCurrency,
  showBudget = true,
  type = 'expense' // 'expense' | 'income'
}) => {
  const [showActions, setShowActions] = useState(false);
  
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

  const handleCardClick = () => {
    setShowActions(!showActions);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowActions(false);
    if (onClick) onClick();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowActions(false);
    if (onRequestDelete) {
      onRequestDelete({ name, type });
    } else if (onDelete) {
      onDelete();
    }
  };

  return (
    <motion.div
      layout
      className={`
        bg-white dark:bg-gray-900 
        rounded-lg shadow-sm 
        border border-gray-200 dark:border-gray-800
        border-l-4 ${colorVariants[color] || colorVariants.blue}
        overflow-hidden
        transition-colors
      `}
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Header row: Icon, Name, Amount */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showActions ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1.5">
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
      </div>

      {/* Expandable Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex divide-x divide-gray-100 dark:divide-gray-800">
              <button
                onClick={handleEdit}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs ${
                  type === 'income' 
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30' 
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                } transition-colors`}
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MobileCategoryCard;
