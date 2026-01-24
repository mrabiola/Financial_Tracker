import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, X, ChevronRight } from 'lucide-react';

const SWIPE_COLORS = {
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-500'
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-500'
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-500'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-500'
  }
};

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 120;

const SwipeableListItem = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionLabel = 'Delete',
  rightActionLabel = 'Edit',
  leftActionIcon: LeftActionIcon = Trash2,
  rightActionIcon: RightActionIcon = ChevronRight,
  leftActionColor = 'red',
  rightActionColor = 'blue',
  disabled = false,
  className = ''
}) => {
  const itemRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [actionTriggered, setActionTriggered] = React.useState(null);
  const startX = React.useRef(0);
  const currentX = React.useRef(0);

  const leftColors = SWIPE_COLORS[leftActionColor] || SWIPE_COLORS.red;
  const rightColors = SWIPE_COLORS[rightActionColor] || SWIPE_COLORS.blue;

  const processSwipeMove = (diff) => {
    const resistance = diff > 0 ? 0.6 : 0.4;
    const offset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff * resistance));
    setSwipeOffset(offset);

    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      setActionTriggered(offset < 0 ? 'left' : 'right');
    } else {
      setActionTriggered(null);
    }
  };

  const processSwipeEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset < 0 && onSwipeLeft) {
        await onSwipeLeft();
      } else if (swipeOffset > 0 && onSwipeRight) {
        await onSwipeRight();
      }
    }

    setSwipeOffset(0);
    setActionTriggered(null);
  };

  const handleTouchStart = (e) => {
    if (disabled) return;
    startX.current = e.targetTouches[0].clientX;
    currentX.current = startX.current;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (disabled || !isDragging) return;
    currentX.current = e.targetTouches[0].clientX;
    processSwipeMove(e.targetTouches[0].clientX - startX.current);
  };

  const handleTouchEnd = () => processSwipeEnd();

  const handleMouseDown = (e) => {
    if (disabled) return;
    startX.current = e.clientX;
    currentX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (disabled || !isDragging) return;
    processSwipeMove(e.clientX - startX.current);
  };

  const handleMouseUp = () => processSwipeEnd();

  const handleReset = () => {
    setSwipeOffset(0);
    setActionTriggered(null);
  };

  return (
    <div
      ref={itemRef}
      className={`relative overflow-hidden ${className}`}
      onMouseLeave={handleReset}
    >
      {/* Left Action Background (revealed when swiping right) */}
      {onSwipeRight && (
        <div
          className={`absolute inset-y-0 right-0 ${rightColors.bg} flex items-center justify-end px-4 transition-opacity duration-200 ${
            swipeOffset > 0 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: Math.max(0, swipeOffset) }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">{rightActionLabel}</span>
            <RightActionIcon className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Right Action Background (revealed when swiping left) */}
      {onSwipeLeft && (
        <div
          className={`absolute inset-y-0 left-0 ${leftColors.bg} flex items-center justify-start px-4 transition-opacity duration-200 ${
            swipeOffset < 0 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: Math.max(0, -swipeOffset) }}
        >
          <div className="flex items-center gap-2 text-white">
            <LeftActionIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{leftActionLabel}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <motion.div
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className={`relative bg-white dark:bg-gray-900 ${
          actionTriggered ? '' : 'transition-shadow'
        }`}
        style={{
          touchAction: 'pan-y pinch-zoom',
          cursor: disabled ? 'default' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {children}
      </motion.div>

      {/* Action hint overlay (shows when swipe threshold is approached) */}
      {actionTriggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 pointer-events-none flex items-center justify-center ${
            actionTriggered === 'left'
              ? `${leftColors.bg} bg-opacity-20`
              : `${rightColors.bg} bg-opacity-20`
          }`}
        >
          <div className={actionTriggered === 'left' ? leftColors.text : rightColors.text}>
            {actionTriggered === 'left' ? (
              <X className="w-12 h-12" strokeWidth={2} />
            ) : (
              <RightActionIcon className="w-12 h-12" strokeWidth={2} />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeableListItem;

export const PullToRefreshWrapper = ({
  children,
  onRefresh,
  isRefreshing = false,
  threshold = 80,
  className = ''
}) => {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isPulling, setIsPulling] = React.useState(false);
  const [willRefresh, setWillRefresh] = React.useState(false);
  const startY = React.useRef(0);
  const containerRef = React.useRef(null);

  const handleTouchStart = (e) => {
    // Only trigger if at the top of scroll
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.targetTouches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.targetTouches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.4;
      const pullY = Math.min(diff * resistance, threshold * 1.5);

      setPullDistance(pullY);
      setWillRefresh(pullY >= threshold);

      // Prevent default only when pulling down
      if (containerRef.current?.scrollTop === 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (willRefresh && onRefresh && !isRefreshing) {
      await onRefresh();
    }

    setPullDistance(0);
    setWillRefresh(false);
  };

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      data-pull-to-refresh="true"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10"
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 30)}px)`,
          opacity: progress
        }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            willRefresh || isRefreshing
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
          }`}
        >
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </motion.div>
      </div>

      {/* Content with offset */}
      <div
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance, threshold * 0.3)}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
