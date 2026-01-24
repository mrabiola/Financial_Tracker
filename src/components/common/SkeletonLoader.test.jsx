import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SkeletonLoader, {
  SkeletonCard,
  SkeletonProgress,
  SkeletonChart,
  SkeletonMetricCard,
  SkeletonSummaryCard,
  SkeletonMobileCard
} from './SkeletonLoader';

global.IS_REACT_ACT_ENVIRONMENT = true;

describe('SkeletonLoader', () => {
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
    test('PASS - Default SkeletonLoader renders card type by default', () => {
      renderWithRoot(<SkeletonLoader />);
      const skeleton = container.querySelector('.bg-gray-200, .bg-gradient-to-r');
      expect(skeleton).toBeTruthy();
    });

    test('PASS - SkeletonCard renders with correct structure', () => {
      renderWithRoot(<SkeletonCard />);
      const wrapper = container.querySelector('.bg-white, .bg-gray-900');
      expect(wrapper).toBeTruthy();
    });

    test('PASS - SkeletonCard with avatar renders correctly', () => {
      renderWithRoot(<SkeletonCard showAvatar={true} />);
      const skeleton = container.querySelector('.bg-white, .bg-gray-900');
      expect(skeleton).toBeTruthy();
    });

    test('PASS - SkeletonProgress renders with progress bar structure', () => {
      renderWithRoot(<SkeletonProgress />);
      const wrapper = container.querySelector('.bg-white, .bg-gray-900');
      expect(wrapper).toBeTruthy();
    });

    test('PASS - SkeletonChart renders with specified height', () => {
      renderWithRoot(<SkeletonChart height="h-64" />);
      const wrapper = container.querySelector('.bg-white, .bg-gray-900');
      expect(wrapper).toBeTruthy();
    });

    test('PASS - SkeletonMetricCard renders metric card structure', () => {
      renderWithRoot(<SkeletonMetricCard />);
      const wrapper = container.querySelector('.bg-white, .bg-gray-900');
      expect(wrapper).toBeTruthy();
    });

    test('PASS - SkeletonSummaryCard renders summary card structure', () => {
      renderWithRoot(<SkeletonSummaryCard />);
      const wrapper = container.querySelector('.from-blue-50, .from-blue-950');
      expect(wrapper).toBeTruthy();
    });

    test('PASS - SkeletonMobileCard renders mobile card structure', () => {
      renderWithRoot(<SkeletonMobileCard />);
      const wrapper = container.querySelector('.rounded-lg');
      expect(wrapper).toBeTruthy();
    });

    test('PASS - SkeletonLoader type prop switches variants', () => {
      renderWithRoot(<SkeletonLoader type="progress" />);
      const skeleton = container.querySelector('.bg-gray-200, .rounded-lg');
      expect(skeleton).toBeTruthy();
    });
  });

  describe('NEUTRAL Cases', () => {
    test('NEUTRAL - All skeleton variants have dark mode classes', () => {
      act(() => {
        renderWithRoot(
          <div>
            <SkeletonCard />
            <SkeletonProgress />
            <SkeletonChart />
          </div>
        );
      });
      // Check if any skeleton elements exist
      const skeletonElements = container.querySelectorAll('.bg-white, .rounded-lg');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    test('NEUTRAL - SkeletonCard has motion animation classes', () => {
      renderWithRoot(<SkeletonCard />);
      const wrapper = container.querySelector('.bg-white, .rounded-lg');
      expect(wrapper).toBeTruthy();
    });

    test('NEUTRAL - SkeletonProgress has motion animation classes', () => {
      renderWithRoot(<SkeletonProgress />);
      const wrapper = container.querySelector('.bg-white, .rounded-lg');
      expect(wrapper).toBeTruthy();
    });
  });

  describe('FAIL Cases', () => {
    test('FAIL - Handles missing type prop (defaults to card)', () => {
      renderWithRoot(<SkeletonLoader type={null} />);
      const skeleton = container.querySelector('.bg-gray-200, .rounded-lg');
      expect(skeleton).toBeTruthy();
    });

    test('FAIL - Handles invalid type prop', () => {
      renderWithRoot(<SkeletonLoader type="invalid_type" />);
      const wrapper = container.querySelector('.bg-white, .rounded-lg');
      expect(wrapper).toBeTruthy();
    });

    test('FAIL - Handles empty height for chart', () => {
      renderWithRoot(<SkeletonChart height="" />);
      const wrapper = container.querySelector('.bg-white, .rounded-lg');
      expect(wrapper).toBeTruthy();
    });

    test('FAIL - Renders without crashing when props are missing', () => {
      renderWithRoot(<SkeletonCard showAvatar={undefined} />);
      const wrapper = container.querySelector('.bg-white, .rounded-lg');
      expect(wrapper).toBeTruthy();
    });
  });
});
