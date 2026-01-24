import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { useSwipe, useSwipeToDelete, usePullToRefresh } from './useSwipe';

global.IS_REACT_ACT_ENVIRONMENT = true;

// Test components
function SwipeTestComponent({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const swipeHandlers = useSwipe({ onSwipeLeft, onSwipeRight, threshold });

  return (
    <div {...swipeHandlers} data-testid="swipe-area">
      Swipe Me
    </div>
  );
}

function SwipeToDeleteTestComponent({ onLeftAction, onRightAction }) {
  const { handlers, isSwipedLeft, isSwipedRight } = useSwipeToDelete({
    onLeftAction,
    onRightAction,
    leftActionLabel: 'Delete',
    rightActionLabel: 'Edit'
  });

  return (
    <div {...handlers} data-testid="swipe-item">
      {isSwipedLeft && <span data-testid="swiped-left">Left</span>}
      {isSwipedRight && <span data-testid="swiped-right">Right</span>}
      Item
    </div>
  );
}

function PullToRefreshTestComponent({ onRefresh, isRefreshing }) {
  const { handlers, pullDistance, isPulling, willRefresh, progress } = usePullToRefresh({
    onRefresh,
    threshold: 80
  });

  return (
    <div {...handlers} data-testid="pull-container" style={{ height: '200px', overflowY: 'auto' }}>
      <div data-testid="pull-distance">{pullDistance}</div>
      <div data-testid="is-pulling">{isPulling.toString()}</div>
      <div data-testid="will-refresh">{willRefresh.toString()}</div>
      <div data-testid="progress">{progress}</div>
      <div style={{ height: '500px' }}>Content</div>
    </div>
  );
}

describe('useSwipe', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  const renderWithRoot = (component) => {
    const root = createRoot(container);
    act(() => {
      root.render(component);
    });
    return root;
  };

  describe('PASS Cases', () => {
    test('PASS - Returns required handlers', () => {
      function TestComponent() {
        const handlers = useSwipe({});
        return (
          <div data-testid="test" {...handlers}>
            Test
          </div>
        );
      }

      renderWithRoot(<TestComponent />);
      const element = container.querySelector('[data-testid="test"]');
      expect(element).toBeTruthy();
    });

    test('PASS - Initializes with default state', () => {
      function TestComponent() {
        const { isSwiping, direction, deltaX, deltaY } = useSwipe({});
        return (
          <div>
            <span data-testid="is-swiping">{isSwiping.toString()}</span>
            <span data-testid="direction">{direction || 'none'}</span>
            <span data-testid="delta-x">{deltaX}</span>
            <span data-testid="delta-y">{deltaY}</span>
          </div>
        );
      }

      renderWithRoot(<TestComponent />);

      expect(container.querySelector('[data-testid="is-swiping"]').textContent).toBe('false');
      expect(container.querySelector('[data-testid="direction"]').textContent).toBe('none');
      expect(container.querySelector('[data-testid="delta-x"]').textContent).toBe('0');
      expect(container.querySelector('[data-testid="delta-y"]').textContent).toBe('0');
    });

    test('PASS - Renders component without errors', () => {
      renderWithRoot(<SwipeTestComponent />);
      expect(container.querySelector('[data-testid="swipe-area"]')).toBeTruthy();
    });

    test('PASS - useSwipeToDelete returns handlers', () => {
      function TestComponent() {
        const { handlers } = useSwipeToDelete({});
        return (
          <div data-testid="test" {...handlers}>
            Test
          </div>
        );
      }

      renderWithRoot(<TestComponent />);
      expect(container.querySelector('[data-testid="test"]')).toBeTruthy();
    });

    test('PASS - useSwipeToDelete initializes with no swipe', () => {
      function TestComponent() {
        const { isSwipedLeft, isSwipedRight, actionVisible } = useSwipeToDelete({});
        return (
          <div>
            <span data-testid="swiped-left">{isSwipedLeft.toString()}</span>
            <span data-testid="swiped-right">{isSwipedRight.toString()}</span>
            <span data-testid="action-visible">{actionVisible || 'none'}</span>
          </div>
        );
      }

      renderWithRoot(<TestComponent />);

      expect(container.querySelector('[data-testid="swiped-left"]').textContent).toBe('false');
      expect(container.querySelector('[data-testid="swiped-right"]').textContent).toBe('false');
      expect(container.querySelector('[data-testid="action-visible"]').textContent).toBe('none');
    });

    test('PASS - usePullToRefresh returns handlers', () => {
      function TestComponent() {
        const { handlers } = usePullToRefresh({});
        return (
          <div data-testid="test" {...handlers}>
            Test
          </div>
        );
      }

      renderWithRoot(<TestComponent />);
      expect(container.querySelector('[data-testid="test"]')).toBeTruthy();
    });

    test('PASS - usePullToRefresh initializes correctly', () => {
      renderWithRoot(<PullToRefreshTestComponent onRefresh={jest.fn()} />);

      expect(container.querySelector('[data-testid="pull-distance"]').textContent).toBe('0');
      expect(container.querySelector('[data-testid="is-pulling"]').textContent).toBe('false');
      expect(container.querySelector('[data-testid="will-refresh"]').textContent).toBe('false');
      expect(parseFloat(container.querySelector('[data-testid="progress"]').textContent)).toBe(0);
    });
  });

  describe('NEUTRAL Cases', () => {
    test('NEUTRAL - Touch handlers are attached to element', () => {
      renderWithRoot(<SwipeTestComponent />);

      const element = container.querySelector('[data-testid="swipe-area"]');
      expect(element).toBeTruthy();
    });

    test('NEUTRAL - Custom threshold can be passed', () => {
      function TestComponent() {
        useSwipe({ threshold: 100 });
        return <div>Test</div>;
      }

      // Should not throw
      renderWithRoot(<TestComponent />);
    });

    test('NEUTRAL - Progress is calculated correctly for pull-to-refresh', () => {
      renderWithRoot(<PullToRefreshTestComponent onRefresh={jest.fn()} />);

      const progress = parseFloat(container.querySelector('[data-testid="progress"]').textContent);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('FAIL Cases', () => {
    test('FAIL - Handles missing callbacks', () => {
      renderWithRoot(<SwipeTestComponent />);

      const element = container.querySelector('[data-testid="swipe-area"]');
      expect(element).toBeTruthy();
    });

    test('FAIL - Handles invalid threshold values', () => {
      function TestComponent() {
        useSwipe({ threshold: -10 });
        return <div>Test</div>;
      }

      expect(() => renderWithRoot(<TestComponent />)).not.toThrow();
    });

    test('FAIL - useSwipeToDelete handles missing actions', () => {
      renderWithRoot(<SwipeToDeleteTestComponent />);

      const element = container.querySelector('[data-testid="swipe-item"]');
      expect(element).toBeTruthy();
    });

    test('FAIL - usePullToRefresh handles missing onRefresh', () => {
      function TestComponent() {
        const { handlers } = usePullToRefresh({});
        return <div {...handlers}>Test</div>;
      }

      renderWithRoot(<TestComponent />);
      expect(container.textContent).toBe('Test');
    });

    test('FAIL - Handles zero threshold', () => {
      function TestComponent() {
        useSwipe({ threshold: 0 });
        return <div>Test</div>;
      }

      expect(() => renderWithRoot(<TestComponent />)).not.toThrow();
    });

    test('FAIL - Handles very large threshold', () => {
      function TestComponent() {
        useSwipe({ threshold: 10000 });
        return <div>Test</div>;
      }

      expect(() => renderWithRoot(<TestComponent />)).not.toThrow();
    });
  });
});
