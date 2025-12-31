import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';

const VARIANT_STYLES = {
  danger: {
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600',
    confirmText: 'text-red-600',
    confirmHover: 'hover:bg-red-50 dark:hover:bg-red-950/30'
  },
  warning: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600',
    confirmText: 'text-amber-700',
    confirmHover: 'hover:bg-amber-50 dark:hover:bg-amber-950/30'
  },
  primary: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600',
    confirmText: 'text-blue-600',
    confirmHover: 'hover:bg-blue-50 dark:hover:bg-blue-950/30'
  }
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;
  const Icon = variant === 'primary' ? Info : AlertTriangle;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-xl z-50 max-w-sm mx-auto overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
                  <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close confirmation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {message}
              </p>
              {itemName && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  "{itemName}"
                </p>
              )}
            </div>

            <div className="flex border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 text-sm font-medium ${styles.confirmText} ${styles.confirmHover} border-l border-gray-200 dark:border-gray-800 transition-colors`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
