import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary, {
  ErrorMessage,
  RetryButton
} from './ErrorBoundary';

global.IS_REACT_ACT_ENVIRONMENT = true;

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
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
    test('PASS - Renders children when no error occurs', () => {
      renderWithRoot(
        <ErrorBoundary>
          <div data-testid="child">Child Component</div>
        </ErrorBoundary>
      );
      expect(container.querySelector('[data-testid="child"]')).toBeTruthy();
      expect(container.textContent).toContain('Child Component');
    });

    test('PASS - Displays retry button', () => {
      renderWithRoot(<RetryButton onRetry={jest.fn()} />);

      expect(container.textContent).toMatch(/retry/i);
    });

    test('PASS - RetryButton shows loading state', () => {
      renderWithRoot(<RetryButton onRetry={jest.fn()} isRetrying={true} />);

      expect(container.textContent).toMatch(/retrying/i);
    });

    test('PASS - ErrorMessage renders with props', () => {
      renderWithRoot(
        <ErrorMessage
          title="Test Error"
          message="This is a test error message"
          variant="danger"
        />
      );

      expect(container.textContent).toContain('Test Error');
      expect(container.textContent).toContain('This is a test error message');
    });
  });

  describe('NEUTRAL Cases', () => {
    test('NEUTRAL - ErrorMessage has correct styling classes', () => {
      renderWithRoot(<ErrorMessage title="Test" message="Test" variant="danger" />);
      expect(container.querySelector('.bg-red-50, .dark\\:bg-red-950') || container.querySelector('.rounded-lg')).toBeTruthy();
    });
  });

  describe('FAIL Cases - Error handling', () => {
    test('FAIL - Renders without crashing when no props provided', () => {
      expect(() => {
        renderWithRoot(<RetryButton />);
      }).not.toThrow();
    });

    test('FAIL - ErrorMessage renders without onRetry', () => {
      expect(() => {
        renderWithRoot(<ErrorMessage title="Test" message="Test" />);
      }).not.toThrow();
    });
  });
});
