import { useState, useRef, useCallback } from 'react';

const DEFAULT_THRESHOLD = 50;
const DEFAULT_RESTRAIN = 100;

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = DEFAULT_THRESHOLD,
  restrain = DEFAULT_RESTRAIN
}) => {
  const [swipeState, setSwipeState] = useState({
    isSwiping: false,
    direction: null,
    deltaX: 0,
    deltaY: 0
  });

  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const onTouchStart = useCallback((e) => {
    touchEnd.current.x = e.targetTouches[0].clientX;
    touchEnd.current.y = e.targetTouches[0].clientY;
    touchStart.current.x = e.targetTouches[0].clientX;
    touchStart.current.y = e.targetTouches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    const deltaX = e.targetTouches[0].clientX - touchStart.current.x;
    const deltaY = e.targetTouches[0].clientY - touchStart.current.y;

    touchEnd.current.x = e.targetTouches[0].clientX;
    touchEnd.current.y = e.targetTouches[0].clientY;

    if (!isDragging.current) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      if (absDeltaX > absDeltaY && absDeltaX > 5) {
        isDragging.current = true;
      } else if (absDeltaY > absDeltaX && absDeltaY > 5) {
        isDragging.current = true;
      }
    }

    if (isDragging.current) {
      e.preventDefault();

      let direction = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setSwipeState({
        isSwiping: true,
        direction,
        deltaX,
        deltaY
      });
    }
  }, [restrain]);

  const onTouchEnd = useCallback((e) => {
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    isDragging.current = false;

    if (absDeltaX > threshold || absDeltaY > threshold) {
      const isHorizontalSwipe = absDeltaX > absDeltaY;
      const isVerticalSwipe = absDeltaY > absDeltaX;

      if (isHorizontalSwipe && absDeltaY < restrain) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight({ deltaX, deltaY });
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft({ deltaX, deltaY });
        }
      } else if (isVerticalSwipe && absDeltaX < restrain) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown({ deltaX, deltaY });
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp({ deltaX, deltaY });
        }
      }
    }

    setSwipeState({
      isSwiping: false,
      direction: null,
      deltaX: 0,
      deltaY: 0
    });
  }, [threshold, restrain, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ...swipeState
  };
};

export const useSwipeToDelete = ({
  onLeftAction,
  onRightAction,
  leftActionLabel = 'Delete',
  rightActionLabel = 'Edit',
  leftActionColor = 'red',
  rightActionColor = 'blue',
  threshold = 100,
  onReset
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [actionVisible, setActionVisible] = useState(null);
  const isAnimating = useRef(false);

  const reset = useCallback(() => {
    setSwipeOffset(0);
    setActionVisible(null);
    if (onReset) onReset();
  }, [onReset]);

  const onTouchStart = useCallback((e) => {
    if (isAnimating.current) return;
    isAnimating.current = false;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (isAnimating.current) return;

    const touch = e.targetTouches[0];
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;

    const offsetX = touch.clientX - startX;
    const maxOffset = 120;
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offsetX));

    setSwipeOffset(clampedOffset);

    if (clampedOffset < -30) {
      setActionVisible('left');
    } else if (clampedOffset > 30) {
      setActionVisible('right');
    } else {
      setActionVisible(null);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (isAnimating.current) return;

    if (Math.abs(swipeOffset) > threshold) {
      isAnimating.current = true;

      if (swipeOffset < 0 && onLeftAction) {
        onLeftAction();
      } else if (swipeOffset > 0 && onRightAction) {
        onRightAction();
      }

      setTimeout(() => {
        reset();
        isAnimating.current = false;
      }, 300);
    } else {
      reset();
    }
  }, [swipeOffset, threshold, onLeftAction, onRightAction, reset]);

  const handlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };

  return {
    handlers,
    swipeOffset,
    isSwipedLeft: actionVisible === 'left',
    isSwipedRight: actionVisible === 'right',
    actionVisible,
    reset
  };
};

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxY = 120
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [willRefresh, setWillRefresh] = useState(false);

  const touchStart = useRef(0);
  const startY = useRef(0);
  const currentElement = useRef(null);

  const onTouchStart = (e) => {
    const target = e.target.closest('[data-pull-to-refresh]');
    if (!target) return;

    currentElement.current = target;
    touchStart.current = e.targetTouches[0].clientY;
    startY.current = target.scrollTop;

    if (startY.current === 0) {
      setIsPulling(true);
    }
  };

  const onTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;

    const touchY = e.targetTouches[0].clientY;
    const diff = touchY - touchStart.current;

    if (diff > 0) {
      e.preventDefault();

      const resistance = 0.4;
      const pullDistance = Math.min(diff * resistance, maxY);

      setPullDistance(pullDistance);
      setWillRefresh(pullDistance >= threshold);
    }
  };

  const onTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (willRefresh && onRefresh && !isRefreshing) {
      setIsRefreshing(true);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setWillRefresh(false);
      }
    }

    setPullDistance(0);
    setWillRefresh(false);
  };

  const handlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };

  return {
    handlers,
    pullDistance,
    isPulling,
    isRefreshing,
    willRefresh,
    progress: Math.min(pullDistance / threshold, 1)
  };
};

export default useSwipe;
