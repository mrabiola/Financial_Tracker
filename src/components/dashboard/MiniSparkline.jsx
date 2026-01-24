import React from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

/**
 * MiniSparkline - A compact trend chart for account detail panels
 *
 * @param {Array} data - Array of { month, value } objects
 * @param {string} color - Line/fill color (hex)
 * @param {number} height - Chart height in pixels
 * @param {string} period - Period label for tooltip
 * @param {Function} formatCurrency - Currency formatting function
 */
const MiniSparkline = ({
  data = [],
  color = '#3b82f6',
  height = 60,
  period = '',
  formatCurrency = (v) => `$${v.toLocaleString()}`
}) => {
  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-gray-400 text-sm">
        No data
      </div>
    );
  }

  // Create gradient ID unique to this instance
  const gradientId = `sparkline-gradient-${color.replace('#', '')}-${period}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid var(--tooltip-border, #e5e7eb)',
            borderRadius: '8px',
            color: 'var(--tooltip-text, #1f2937)',
            fontSize: '12px',
            padding: '8px 12px'
          }}
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MiniSparkline;
