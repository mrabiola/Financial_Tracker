import React from 'react';
import { motion } from 'framer-motion';

const shimmerAnimation = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: {
    repeat: Infinity,
    duration: 1.5,
    ease: 'easeInOut'
  }
};

const SkeletonBase = ({ className = '', height = 'h-4', width = 'w-full' }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded ${className} ${height} ${width}`}>
    <motion.div
      {...shimmerAnimation}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
    />
  </div>
);

export const SkeletonCard = ({ showAvatar = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
  >
    <div className="flex items-center gap-3">
      {showAvatar && (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <SkeletonBase height="h-4" width="w-3/4" className="mb-2" />
        <SkeletonBase height="h-3" width="w-1/2" />
      </div>
      <SkeletonBase height="h-6" width="w-16" />
    </div>
  </motion.div>
);

export const SkeletonProgress = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
  >
    <div className="flex items-center justify-between mb-2">
      <SkeletonBase height="h-4" width="w-1/2" />
      <SkeletonBase height="h-3" width="w-12" />
    </div>
    <SkeletonBase height="h-2" width="w-full" className="rounded-full" />
  </motion.div>
);

export const SkeletonChart = ({ height = 'h-48' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <SkeletonBase height="h-5" width="w-32" />
      <div className="flex gap-2">
        <SkeletonBase height="h-8" width="w-16" className="rounded-full" />
        <SkeletonBase height="h-8" width="w-16" className="rounded-full" />
      </div>
    </div>
    <div className={`${height} flex items-end gap-2`}>
      {[...Array(6)].map((_, i) => (
        <SkeletonBase key={i} height="h-full" width="w-full" className="flex-1" />
      ))}
    </div>
  </motion.div>
);

export const SkeletonTableRow = ({ cells = 4 }) => (
  <tr className="animate-pulse">
    {[...Array(cells)].map((_, i) => (
      <td key={i} className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <SkeletonBase height="h-4" width={i === 0 ? 'w-3/4' : 'w-1/2'} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, cells = 4 }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        {[...Array(cells)].map((_, i) => (
          <th key={i} className="px-4 py-3 text-left">
            <SkeletonBase height="h-4" width="w-20" />
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <SkeletonTableRow key={i} cells={cells} />
      ))}
    </tbody>
  </div>
);

export const SkeletonMetricCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
  >
    <SkeletonBase height="h-4" width="w-24" className="mb-3" />
    <SkeletonBase height="h-8" width="w-32" className="mb-2" />
    <SkeletonBase height="h-3" width="w-20" />
  </motion.div>
);

export const SkeletonSummaryCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-lg p-6"
  >
    <SkeletonBase height="h-4" width="w-28" className="mb-2 bg-blue-200/50 dark:bg-blue-800/50" />
    <SkeletonBase height="h-10" width="w-40" className="mb-2 bg-blue-200/50 dark:bg-blue-800/50" />
    <SkeletonBase height="h-3" width="w-24" className="bg-blue-200/50 dark:bg-blue-800/50" />
  </motion.div>
);

export const SkeletonMobileCard = () => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-800"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <SkeletonBase height="h-3" width="w-32" className="mb-1.5" />
        <SkeletonBase height="h-2.5" width="w-20" />
      </div>
      <SkeletonBase height="h-5" width="w-14" />
    </div>
  </motion.div>
);

const SkeletonLoader = ({ type = 'card', ...props }) => {
  const variants = {
    card: SkeletonCard,
    progress: SkeletonProgress,
    chart: SkeletonChart,
    table: SkeletonTable,
    metric: SkeletonMetricCard,
    summary: SkeletonSummaryCard,
    mobileCard: SkeletonMobileCard
  };

  const Component = variants[type] || SkeletonCard;
  return <Component {...props} />;
};

export default SkeletonLoader;
