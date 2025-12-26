import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronDown, Check } from 'lucide-react';

/**
 * Mobile-optimized quick entry modal (bottom sheet style)
 * For entering income/expense amounts with category selection
 */
const MobileQuickEntry = ({
  isOpen,
  onClose,
  onSave,
  categories = [],
  selectedCategory,
  selectedMonth,
  selectedYear,
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  type = 'expense', // 'expense' | 'income'
  initialValue = '',
  formatCurrency
}) => {
  const [amount, setAmount] = useState(initialValue);
  const [category, setCategory] = useState(selectedCategory || '');
  const [month, setMonth] = useState(selectedMonth);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setAmount(initialValue);
      setCategory(selectedCategory || '');
      setMonth(selectedMonth);
      setNotes('');
    }
  }, [isOpen, initialValue, selectedCategory, selectedMonth]);

  const handleSave = () => {
    if (!category || !amount) return;
    
    onSave({
      category,
      amount: parseFloat(amount) || 0,
      month,
      notes,
      type
    });
    
    // Reset and close
    setAmount('');
    setNotes('');
    onClose();
  };

  const handleAmountChange = (e) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return; // Max 2 decimal places
    setAmount(value);
  };

  // Get accent colors based on type
  const accentBg = type === 'income' ? 'bg-green-500' : 'bg-red-500';
  const accentBgLight = type === 'income' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30';
  const accentText = type === 'income' ? 'text-green-600' : 'text-red-600';
  const accentBorder = type === 'income' ? 'border-green-500' : 'border-red-500';
  const accentRing = type === 'income' ? 'focus:ring-green-500' : 'focus:ring-red-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {type === 'income' ? 'Add Income' : 'Add Expense'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                    $
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className={`
                      w-full pl-8 pr-3 py-2.5 
                      text-xl font-semibold text-gray-900 dark:text-gray-100
                      bg-gray-50 dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-700 
                      rounded-lg
                      focus:outline-none focus:border-2 ${accentBorder} ${accentRing}
                      transition-colors
                    `}
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1.5
                        rounded-full border 
                        text-xs font-medium
                        transition-all
                        ${category === cat.name
                          ? `${accentBgLight} ${accentBorder} ${accentText}`
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.name}</span>
                      {category === cat.name && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Date
                </label>
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{months[month]} {selectedYear}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                </button>

                {/* Month Picker Grid */}
                <AnimatePresence>
                  {showMonthPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-4 gap-1.5">
                        {months.map((m, idx) => (
                          <button
                            key={m}
                            onClick={() => {
                              setMonth(idx);
                              setShowMonthPicker(false);
                            }}
                            className={`
                              py-2 rounded-lg text-xs font-medium transition-colors
                              ${month === idx
                                ? `${accentBg} text-white`
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }
                            `}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notes (optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Footer with Save button */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={handleSave}
                disabled={!category || !amount}
                className={`
                  w-full py-2.5 rounded-lg font-semibold text-white text-sm
                  transition-all
                  ${!category || !amount
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    : `${accentBg} active:scale-[0.98]`
                  }
                `}
              >
                Save {type === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileQuickEntry;
