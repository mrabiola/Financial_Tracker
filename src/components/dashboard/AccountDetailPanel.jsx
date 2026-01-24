import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccountDetailContent from './AccountDetailContent';

/**
 * AccountDetailPanel - Row expansion panel for desktop table view
 *
 * @param {boolean} isExpanded - Whether the panel is expanded
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
 * @param {number} colSpan - Number of columns to span
 * @param {Function} onUpdateMetadata - Callback to update metadata
 * @param {Function} onOpenFullModal - Callback to open full metadata modal
 */
const AccountDetailPanel = ({
  isExpanded = false,
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
  colSpan = 14, // Account + 12 months + Actions
  onUpdateMetadata = () => {},
  onOpenFullModal = () => {}
}) => {
  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <tr className="account-detail-row">
          <td colSpan={colSpan} className="p-0 border-0">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-800">
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
                  isMobile={false}
                />
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </AnimatePresence>
  );
};

export default AccountDetailPanel;
