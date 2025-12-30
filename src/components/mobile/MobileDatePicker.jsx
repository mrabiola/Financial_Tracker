import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Unified Mobile Date Picker Component
 * Handles both month and year selection in a single, compact picker
 */
const MobileDatePicker = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'

  // Navigate months quickly with arrows
  const goToPrevMonth = (e) => {
    e.stopPropagation();
    if (selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = (e) => {
    e.stopPropagation();
    if (selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Generate years for grid (current year +/- 5 years)
  const yearRange = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);

  return (
    <>
      {/* Compact Date Selector */}
      <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        <button
          onClick={goToPrevMonth}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={() => { setIsOpen(true); setViewMode('month'); }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
        </button>
        
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Full Date Picker Modal - using same wrapper pattern as ConversionModal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/50"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 w-[90%] max-w-xs shadow-xl"
              >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Select Date
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 mb-3">
                <button
                  onClick={() => setViewMode('month')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'month'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('year')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'year'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Year
                </button>
              </div>

              {/* Month Grid */}
              {viewMode === 'month' && (
                <>
                  {/* Current Year Display */}
                  <div className="text-center mb-2">
                    <button
                      onClick={() => setViewMode('year')}
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {selectedYear} ▾
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((month, idx) => {
                      const isSelected = idx === selectedMonth;
                      const isCurrent = idx === currentMonth && selectedYear === currentYear;
                      
                      return (
                        <button
                          key={month}
                          onClick={() => {
                            setSelectedMonth(idx);
                            setIsOpen(false);
                          }}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : isCurrent
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Year Grid */}
              {viewMode === 'year' && (
                <div className="grid grid-cols-3 gap-1.5">
                  {yearRange.map((year) => {
                    const isSelected = year === selectedYear;
                    const isCurrent = year === currentYear;
                    
                    return (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setViewMode('month');
                        }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : isCurrent
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick Jump */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    setSelectedMonth(currentMonth);
                    setSelectedYear(currentYear);
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Jump to Today ({MONTHS[currentMonth]} {currentYear})
                </button>
              </div>
            </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDatePicker;
