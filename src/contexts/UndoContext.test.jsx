import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { UndoProvider, useUndo, useUndoAction } from './UndoContext';

global.IS_REACT_ACT_ENVIRONMENT = true;

// Test component to use the hook
function TestComponent({ children }) {
  return <UndoProvider>{children}</UndoProvider>;
}

function UndoTestComponent() {
  const { addAction, undo, hasUndo, lastAction, undoCount, clearHistory } = useUndo();
  const { addAccountUndo, addGoalUndo, addClearDataUndo } = useUndoAction();

  return (
    <div>
      <span data-testid="has-undo">{hasUndo.toString()}</span>
      <span data-testid="undo-count">{undoCount}</span>
      {lastAction && <span data-testid="last-action">{lastAction.description}</span>}
      <button
        data-testid="add-account-undo"
        onClick={() =>
          addAccountUndo({ id: '1', name: 'Test Account', type: 'asset' }, async () => {})
        }
      >
        Add Account Undo
      </button>
      <button
        data-testid="add-goal-undo"
        onClick={() =>
          addGoalUndo({ id: '1', name: 'Test Goal', target: 1000 }, async () => {})
        }
      >
        Add Goal Undo
      </button>
      <button
        data-testid="add-clear-undo"
        onClick={() => addClearDataUndo('cashflow', async () => {})}
      >
        Add Clear Undo
      </button>
      <button data-testid="undo" onClick={undo}>
        Undo
      </button>
      <button data-testid="clear-history" onClick={clearHistory}>
        Clear History
      </button>
    </div>
  );
}

describe('UndoContext', () => {
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
    test('PASS - Provides default values on mount', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      expect(container.querySelector('[data-testid="has-undo"]').textContent).toBe('false');
      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('0');
    });

    test('PASS - addAction adds action to history', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-account-undo"]'));
      });

      expect(container.querySelector('[data-testid="has-undo"]').textContent).toBe('true');
      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('1');
    });

    test('PASS - lastAction returns most recent action', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-account-undo"]'));
      });

      expect(container.querySelector('[data-testid="last-action"]').textContent).toBe('Deleted "Test Account"');
    });

    test('PASS - addAccountUndo creates correct action description', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-account-undo"]'));
      });

      expect(container.querySelector('[data-testid="last-action"]').textContent).toBe('Deleted "Test Account"');
    });

    test('PASS - addGoalUndo creates correct action description', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-goal-undo"]'));
      });

      expect(container.querySelector('[data-testid="last-action"]').textContent).toBe('Deleted goal "Test Goal"');
    });

    test('PASS - addClearDataUndo creates correct action description', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-clear-undo"]'));
      });

      expect(container.querySelector('[data-testid="last-action"]').textContent).toBe('Cleared cashflow data');
    });

    test('PASS - Multiple actions increment undo count', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-account-undo"]'));
      });

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-goal-undo"]'));
      });

      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('2');
    });

    test('PASS - clearHistory removes all actions', () => {
      renderWithRoot(
        <TestComponent>
          <UndoTestComponent />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-account-undo"]'));
      });

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-goal-undo"]'));
      });

      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('2');

      act(() => {
        Simulate.click(container.querySelector('[data-testid="clear-history"]'));
      });

      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('0');
    });
  });

  describe('NEUTRAL Cases', () => {
    test('NEUTRAL - Action has correct metadata structure', () => {
      function TestMetadata() {
        const { addAction, lastAction } = useUndo();

        return (
          <div>
            {lastAction && <span data-testid="action-type">{lastAction.type}</span>}
            <button
              data-testid="add-action"
              onClick={() =>
                addAction({
                  type: 'custom_action',
                  description: 'Custom action',
                  restore: async () => {},
                  metadata: { key: 'value' }
                })
              }
            >
              Add
            </button>
          </div>
        );
      }

      renderWithRoot(
        <TestComponent>
          <TestMetadata />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-action"]'));
      });

      expect(container.querySelector('[data-testid="action-type"]').textContent).toBe('custom_action');
    });

    test('NEUTRAL - History is limited to MAX_UNDO_HISTORY (10)', () => {
      function TestHistoryLimit() {
        const { addAction, undoCount } = useUndo();

        return (
          <div>
            <span data-testid="undo-count">{undoCount}</span>
            <button
              data-testid="add-multiple"
              onClick={() => {
                for (let i = 0; i < 15; i++) {
                  addAction({
                    type: 'test',
                    description: `Action ${i}`,
                    restore: async () => {}
                  });
                }
              }}
            >
              Add 15
            </button>
          </div>
        );
      }

      renderWithRoot(
        <TestComponent>
          <TestHistoryLimit />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-multiple"]'));
      });

      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('10');
    });

    test('NEUTRAL - Most recent action is first in history', () => {
      function TestOrder() {
        const { addAction, lastAction } = useUndo();

        return (
          <div>
            {lastAction && <span data-testid="last-desc">{lastAction.description}</span>}
            <button
              data-testid="add-first"
              onClick={() =>
                addAction({ type: 'test', description: 'First', restore: async () => {} })
              }
            >
              First
            </button>
            <button
              data-testid="add-second"
              onClick={() =>
                addAction({ type: 'test', description: 'Second', restore: async () => {} })
              }
            >
              Second
            </button>
          </div>
        );
      }

      renderWithRoot(
        <TestComponent>
          <TestOrder />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-first"]'));
      });

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-second"]'));
      });

      expect(container.querySelector('[data-testid="last-desc"]').textContent).toBe('Second');
    });
  });

  describe('FAIL Cases', () => {
    test('FAIL - Undo does nothing when history is empty', () => {
      function TestEmptyUndo() {
        const { undo, undoCount } = useUndo();

        return (
          <div>
            <span data-testid="undo-count">{undoCount}</span>
            <button data-testid="undo" onClick={undo}>
              Undo
            </button>
          </div>
        );
      }

      renderWithRoot(
        <TestComponent>
          <TestEmptyUndo />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="undo"]'));
      });

      expect(container.querySelector('[data-testid="undo-count"]').textContent).toBe('0');
    });

    test('FAIL - Handles actions without metadata', () => {
      function TestNoMetadata() {
        const { addAction, lastAction } = useUndo();

        return (
          <div>
            {lastAction && <span data-testid="has-meta">{lastAction.metadata ? 'yes' : 'no'}</span>}
            <button
              data-testid="add-no-meta"
              onClick={() =>
                addAction({ type: 'test', description: 'No meta', restore: async () => {} })
              }
            >
              Add
            </button>
          </div>
        );
      }

      renderWithRoot(
        <TestComponent>
          <TestNoMetadata />
        </TestComponent>
      );

      act(() => {
        Simulate.click(container.querySelector('[data-testid="add-no-meta"]'));
      });

      expect(container.querySelector('[data-testid="has-meta"]').textContent).toBe('no');
    });
  });
});
