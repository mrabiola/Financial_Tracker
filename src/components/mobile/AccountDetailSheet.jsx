import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AccountDetailContent from '../dashboard/AccountDetailContent';

/**
 * AccountDetailSheet - Bottom sheet detail view for mobile
 *
 * @param {boolean} isOpen - Whether the sheet is open
 * @param {Function} onClose - Callback to close the sheet
 * @param {Object} account - Account object
 * @param {string} accountType - 'asset' | 'liability'
 * @param {number} currentValue - Current account value
 * @param {number} selectedMonth - Selected month index (0-11)
 * @param {number} selectedYear - Selected year
 * @param {Function} getSnapshotValue - Function to get snapshot value
 * @param {Function} formatCurrency - Currency formatting function
 * @param {Function} formatCurrencyShort - Short currency formatting
 * @param {Function} getCurrencySymbol - Function to get currency symbol
 * @param {string} currency - Current currency code
 * @param {Function} onUpdateMetadata - Callback to update metadata
 * @param {Function} onOpenFullModal - Callback to open full metadata modal
 */
const AccountDetailSheet = ({
  isOpen = false,
  onClose = () => {},
  account,
  accountType = 'asset',
  currentValue = 0,
  selectedMonth = 0,
  selectedYear = new Date().getFullYear(),
  getSnapshotValue,
  formatCurrency,
  formatCurrencyShort,
  getCurrencySymbol,
  currency,
  onUpdateMetadata = () => {},
  onOpenFullModal = () => {}
}) => {
  if (!account) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Account Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-140px)]">
              <AccountDetailContent
                account={account}
                accountType={accountType}
                currentValue={currentValue}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                getSnapshotValue={getSnapshotValue}
                formatCurrency={formatCurrency}
                formatCurrencyShort={formatCurrencyShort}
                getCurrencySymbol={getCurrencySymbol}
                currency={currency}
                onUpdateMetadata={onUpdateMetadata}
                onOpenFullModal={onOpenFullModal}
                isMobile={true}
              />
            </div>

            {/* Close button at bottom */}
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountDetailSheet;
