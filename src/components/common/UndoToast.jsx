import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

const UNDO_VARIANTS = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-900/50',
    text: 'text-blue-700 dark:text-blue-200',
    icon: 'text-blue-600'
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-900/50',
    text: 'text-green-700 dark:text-green-200',
    icon: 'text-green-600'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900/50',
    text: 'text-amber-700 dark:text-amber-200',
    icon: 'text-amber-600'
  }
};

const UndoToast = ({
  message,
  onUndo,
  onClose,
  duration = 5000,
  isUndoing = false
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (!isUndoing) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isUndoing, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-auto md:min-w-[320px] z-50"
      >
        <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
          <p className="flex-1 text-sm font-medium">
            {message}
          </p>

          {!isUndoing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </motion.button>
          )}

          {isUndoing && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium flex-shrink-0">
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Undoing...
            </div>
          )}

          {!isUndoing && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const UndoToastContainer = ({ actions, onUndo, onDismiss, isUndoing }) => {
  const latestAction = actions?.[0];

  if (!latestAction) return null;

  return (
    <UndoToast
      message={latestAction.description}
      onUndo={() => onUndo(latestAction)}
      onClose={onDismiss}
      isUndoing={isUndoing}
    />
  );
};

export const UndoBanner = ({
  message,
  onUndo,
  onClose,
  variant = 'info'
}) => {
  const styles = UNDO_VARIANTS[variant] || UNDO_VARIANTS.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg px-4 py-2 flex items-center justify-between gap-3`}
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onUndo}
        className="font-semibold hover:underline text-sm flex-shrink-0"
      >
        Undo
      </button>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4 opacity-60" />
      </button>
    </motion.div>
  );
};

export default UndoToast;
