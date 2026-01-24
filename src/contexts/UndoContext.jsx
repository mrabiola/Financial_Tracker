import React, { createContext, useContext, useState, useCallback } from 'react';

const MAX_UNDO_HISTORY = 10;

const UndoContext = createContext(undefined);

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (context === undefined) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
};

export const UndoProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addAction = useCallback((action) => {
    const undoAction = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      type: action.type,
      description: action.description,
      restore: action.restore,
      metadata: action.metadata || null
    };

    setHistory(prev => {
      const newHistory = [undoAction, ...prev];
      return newHistory.slice(0, MAX_UNDO_HISTORY);
    });
  }, []);

  const undo = useCallback(async () => {
    if (history.length === 0) return null;

    const mostRecent = history[0];

    try {
      await mostRecent.restore();
      setHistory(prev => prev.slice(1));
      return mostRecent;
    } catch (error) {
      console.error('Undo failed:', error);
      throw error;
    }
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeAction = useCallback((actionId) => {
    setHistory(prev => prev.filter(action => action.id !== actionId));
  }, []);

  const hasUndo = history.length > 0;
  const lastAction = history.length > 0 ? history[0] : null;
  const undoCount = history.length;

  const value = {
    history,
    addAction,
    undo,
    clearHistory,
    removeAction,
    hasUndo,
    lastAction,
    undoCount
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
};

export const useUndoAction = () => {
  const { addAction } = useUndo();

  const addAccountUndo = useCallback((account, restoreFn) => {
    addAction({
      type: 'delete_account',
      description: `Deleted "${account.name}"`,
      restore: restoreFn,
      metadata: {
        accountType: account.type,
        accountId: account.id,
        accountName: account.name
      }
    });
  }, [addAction]);

  const addGoalUndo = useCallback((goal, restoreFn) => {
    addAction({
      type: 'delete_goal',
      description: `Deleted goal "${goal.name}"`,
      restore: restoreFn,
      metadata: {
        goalId: goal.id,
        goalName: goal.name,
        target: goal.target
      }
    });
  }, [addAction]);

  const addClearDataUndo = useCallback((dataType, restoreFn) => {
    addAction({
      type: 'clear_data',
      description: `Cleared ${dataType} data`,
      restore: restoreFn,
      metadata: { dataType }
    });
  }, [addAction]);

  const addSnapshotUndo = useCallback((account, oldValue, newValue, monthIndex, restoreFn) => {
    addAction({
      type: 'update_snapshot',
      description: `Changed "${account.name}" value`,
      restore: restoreFn,
      metadata: {
        accountId: account.id,
        accountName: account.name,
        oldValue,
        newValue,
        monthIndex
      }
    });
  }, [addAction]);

  const addCashflowUndo = useCallback((category, type, oldValue, monthIndex, restoreFn) => {
    addAction({
      type: 'update_cashflow',
      description: `Changed ${type} "${category}"`,
      restore: restoreFn,
      metadata: {
        category,
        cashflowType: type,
        oldValue,
        monthIndex
      }
    });
  }, [addAction]);

  return {
    addAccountUndo,
    addGoalUndo,
    addClearDataUndo,
    addSnapshotUndo,
    addCashflowUndo
  };
};

export default UndoContext;
