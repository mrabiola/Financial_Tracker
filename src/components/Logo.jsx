import React from 'react';

const Logo = ({ className = '', size = 'default', showText = true }) => {
  const sizes = {
    small: { icon: 32, text: 18 },
    default: { icon: 40, text: 24 },
    large: { icon: 64, text: 32 },
    xlarge: { icon: 96, text: 40 }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background Circle */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="url(#gradientBg)"
          opacity="0.1"
        />
        
        {/* Hexagon Shape - Representing stability and structure */}
        <path
          d="M32 8 L50 20 L50 44 L32 56 L14 44 L14 20 Z"
          stroke="url(#gradientMain)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Growth Chart Bars */}
        <rect x="22" y="38" width="4" height="10" fill="url(#gradientMain)" opacity="0.7" />
        <rect x="30" y="34" width="4" height="14" fill="url(#gradientMain)" opacity="0.8" />
        <rect x="38" y="28" width="4" height="20" fill="url(#gradientMain)" opacity="0.9" />
        
        {/* Upward Arrow - Growth indicator */}
        <path
          d="M32 18 L38 26 L35 26 L35 32 L29 32 L29 26 L26 26 Z"
          fill="url(#gradientAccent)"
        />
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradientAccent" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span 
            className="font-bold tracking-tight leading-none"
            style={{ 
              fontSize: `${currentSize.text}px`,
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            WealthTrak
          </span>
          {size === 'large' || size === 'xlarge' ? (
            <span className="text-xs text-gray-500 mt-0.5">Financial Net Worth Tracker</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Logo;