import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  detectAccountCategory,
  getMetadataFields,
  validateMetadata,
  ACCOUNT_CATEGORIES
} from '../../utils/accountMetadataUtils';

/**
 * AccountMetadataModal - Modal for editing account metadata
 * Responsive: centered modal on desktop, bottom sheet on mobile
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onSave - Callback to save metadata (accountId, metadata) => Promise
 * @param {Object} account - Account object being edited
 * @param {string} currency - Current currency symbol
 */
const AccountMetadataModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = async () => {},
  account = null,
  currency = '$'
}) => {
  const isMobile = useIsMobile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Detect category from account name
  const accountCategory = useMemo(
    () => account ? detectAccountCategory(account.name, account.type) : ACCOUNT_CATEGORIES.GENERAL,
    [account]
  );

  // Get fields for this category
  const metadataFields = useMemo(
    () => getMetadataFields(accountCategory),
    [accountCategory]
  );

  // Initialize form state from account metadata
  const [formData, setFormData] = useState(() => {
    if (!account) return {};

    const initialData = {};
    metadataFields.forEach(field => {
      const value = account.metadata?.[field.key];
      if (value !== undefined && value !== null && value !== '') {
        initialData[field.key] = value;
      }
    });
    return initialData;
  });

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      const initialData = {};
      metadataFields.forEach(field => {
        const value = account.metadata?.[field.key];
        if (value !== undefined && value !== null && value !== '') {
          initialData[field.key] = value;
        }
      });
      setFormData(initialData);
      setError('');
    }
  }, [account, metadataFields]);

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSave = async () => {
    if (!account) return;

    // Validate
    const validation = validateMetadata(formData, accountCategory);
    if (!validation.valid) {
      setError(validation.errors[0] || 'Please check your input');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(account.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save metadata');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.key] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        );

      case 'number':
        return (
          <div key={field.key} className="relative">
            {field.key.includes('Price') || field.key.includes('Amount') || field.key.includes('limit') ? (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {currency}
              </span>
            ) : null}
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.key === 'interestRate' || field.key === 'apr' ? 0.01 : 1}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                field.key.includes('Price') || field.key.includes('Amount') || field.key.includes('limit') ? 'pl-8' : ''
              }`}
            />
          </div>
        );

      case 'date':
        return (
          <input
            key={field.key}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            key={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{field.placeholder}</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>
                {opt === 'primary' ? 'Primary Residence' :
                 opt === 'rental' ? 'Rental Property' :
                 opt === 'investment' ? 'Investment Property' :
                 opt === 'vacation' ? 'Vacation Home' :
                 opt === 'roth_ira' ? 'Roth IRA' :
                 opt === '401k' ? '401(k)' :
                 opt === 'hisa' ? 'High-Yield Savings' :
                 opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            key={field.key}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  if (isMobile) {
    // Mobile: Bottom sheet
    return (
      <AnimatePresence>
        {isOpen && account && (
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
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[90vh] overflow-hidden"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit {account.name}
                </h2>
                <button onClick={onClose} className="p-2 -mr-2">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                {metadataFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Centered modal
  return (
    <AnimatePresence>
      {isOpen && account && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit {account.name}
                </h2>
                <button onClick={onClose} className="p-2 -mr-2">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                {metadataFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountMetadataModal;
