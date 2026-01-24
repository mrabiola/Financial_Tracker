import React, { act } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';

global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('recharts', () => {
  const React = require('react');
  const Container = ({ children }) => <div>{children}</div>;
  const MockChart = () => <div />;

  return {
    LineChart: MockChart,
    Line: MockChart,
    BarChart: MockChart,
    Bar: MockChart,
    PieChart: MockChart,
    Pie: MockChart,
    Cell: MockChart,
    XAxis: MockChart,
    YAxis: MockChart,
    CartesianGrid: MockChart,
    Tooltip: MockChart,
    Legend: MockChart,
    ResponsiveContainer: Container,
    Area: MockChart,
    ComposedChart: MockChart,
    ReferenceArea: MockChart
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  const stripMotionProps = (props) => {
    const {
      whileTap,
      initial,
      animate,
      exit,
      transition,
      ...rest
    } = props;
    return rest;
  };

  const MockDiv = React.forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...stripMotionProps(props)}>
      {children}
    </div>
  ));

  return {
    motion: { div: MockDiv },
    AnimatePresence: ({ children }) => <div>{children}</div>
  };
});

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

jest.mock('../../hooks/useMediaQuery', () => ({
  useIsMobile: () => false
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } })
}));

jest.mock('../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    formatCurrency: (value) => `$${value}`,
    formatCurrencyShort: (value) => `$${value}`,
    getCurrencySymbol: () => '$',
    currency: 'USD'
  })
}));

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

const mockUpdateSnapshot = jest.fn();
const mockDeleteSnapshot = jest.fn();
const mockGetSnapshotValue = jest.fn((_accountId, monthIndex) => {
  const currentMonth = new Date().getMonth();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  return monthIndex === prevMonth ? 100 : 0;
});
const mockGetSnapshotCurrencyData = jest.fn((_accountId, monthIndex) => {
  const currentMonth = new Date().getMonth();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  return monthIndex === prevMonth ? { originalValue: 100, originalCurrency: 'USD' } : null;
});
const mockAddAccount = jest.fn();
const mockAccounts = { assets: [{ id: 'asset-1', name: 'Cash' }], liabilities: [] };

jest.mock('../../hooks/useFinancialDataDemo', () => ({
  useFinancialDataDemo: () => ({
    loading: false,
    error: null,
    accounts: mockAccounts,
    goals: [],
    addAccount: mockAddAccount,
    deleteAccount: jest.fn(),
    updateSnapshot: mockUpdateSnapshot,
    deleteSnapshot: mockDeleteSnapshot,
    addGoal: jest.fn(),
    updateGoalProgress: jest.fn(),
    deleteGoal: jest.fn(),
    snapshots: { 'asset-1_4': 100 },
    getSnapshotValue: mockGetSnapshotValue,
    getSnapshotCurrencyData: mockGetSnapshotCurrencyData,
    fetchMultiYearSnapshots: null,
    reload: jest.fn(),
    isDemo: true
  })
}));

jest.mock('../../hooks/useFinancialHealthTrend', () => ({
  useFinancialHealthTrend: () => ({
    snapshots: [],
    settings: null,
    loading: false,
    reload: jest.fn()
  })
}));

jest.mock('../../hooks/useCashflowData', () => ({
  useCashflowData: () => ({
    cashflowData: [],
    incomeCategories: [],
    expenseCategories: [],
    saveCashflowData: jest.fn(),
    calculateMetrics: jest.fn(() => ({
      totalIncome: 0,
      totalExpenses: 0,
      netCashflow: 0,
      ytdNetCashflow: 0,
      ytdSavingsRate: 0,
      monthSavingsRate: 0,
      ytdIncome: 0,
      ytdExpenses: 0
    })),
    copyPreviousMonth: jest.fn(),
    addCategory: jest.fn(),
    deleteCategory: jest.fn()
  })
}));

jest.mock('../../utils/diagnosticStorage', () => ({
  buildBaselineSettings: jest.fn(),
  buildHealthSnapshotPayload: jest.fn(),
  clearStoredDiagnosticResults: jest.fn(),
  getStoredDiagnosticResults: jest.fn(() => null)
}));

jest.mock('../common/LoadingSpinner', () => () => <div>Loading</div>);
jest.mock('../mobile/MobileAnalyticsView', () => () => <div>MobileAnalyticsView</div>);
jest.mock('../mobile/MobileNetWorthView', () => () => <div>MobileNetWorthView</div>);
jest.mock('../mobile/MobileCashflowView', () => () => <div>MobileCashflowView</div>);
jest.mock('../mobile/MobileDatePicker', () => () => <div>MobileDatePicker</div>);
jest.mock('../diagnostic/DiagnosticBaselineModal', () => () => <div>DiagnosticBaselineModal</div>);
jest.mock('./SimpleImportModal', () => () => <div>SimpleImportModal</div>);
jest.mock('./CashflowSection', () => () => <div>CashflowSection</div>);

const NetWorthTracker = require('./NetWorthTracker').default;

describe('NetWorthTracker', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockUpdateSnapshot.mockClear();
    mockDeleteSnapshot.mockClear();
    mockAddAccount.mockClear();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  it('shows net worth progression chart on the analytics tab', () => {
    act(() => {
      root.render(<NetWorthTracker />);
    });

    const analyticsButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Analytics')
    );

    expect(analyticsButton).toBeTruthy();

    act(() => {
      analyticsButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Net Worth Progression');
    expect(container.textContent).not.toContain('Net Worth Trend -');
  });

  it('shows the YoY comparison view when switching to yearly', () => {
    act(() => {
      root.render(<NetWorthTracker />);
    });

    const analyticsButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Analytics')
    );

    act(() => {
      analyticsButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const yearlyButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Yearly')
    );

    act(() => {
      yearlyButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Net Worth Comparison');
    expect(container.textContent).toContain('ALL');
  });

  it('confirms copy previous month and shows undo', async () => {
    act(() => {
      root.render(<NetWorthTracker />);
    });

    const copyButton = container.querySelector('button[title="Copy values from previous month"]');
    expect(copyButton).toBeTruthy();

    act(() => {
      copyButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Copy net worth values');

    const confirmButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent.trim() === 'Copy'
    );

    expect(confirmButton).toBeTruthy();

    await act(async () => {
      confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockUpdateSnapshot).toHaveBeenCalled();
    expect(container.textContent).toContain('Undo copy');
  });

  it('shows a delete confirmation for assets', () => {
    act(() => {
      root.render(<NetWorthTracker />);
    });

    const deleteButton = container.querySelector('button[aria-label="Delete asset"]');
    expect(deleteButton).toBeTruthy();

    act(() => {
      deleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Delete asset');
  });

  it('adds an asset from the inline add form', async () => {
    act(() => {
      root.render(<NetWorthTracker />);
    });

    const addAssetButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Add Asset')
    );
    expect(addAssetButton).toBeTruthy();

    act(() => {
      addAssetButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = container.querySelector('input[placeholder="Account name (e.g., House, 401k, Savings)"]');
    expect(input).toBeTruthy();

    act(() => {
      Simulate.change(input, { target: { value: 'Test Asset' } });
    });

    const saveButton = container.querySelector('button[aria-label="Save asset"]');
    expect(saveButton).toBeTruthy();

    await act(async () => {
      saveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockAddAccount).toHaveBeenCalledWith('Test Asset', 'asset');
  });

  it('adds a liability from the inline add form', async () => {
    act(() => {
      root.render(<NetWorthTracker />);
    });

    const addLiabilityButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Add Liability')
    );
    expect(addLiabilityButton).toBeTruthy();

    act(() => {
      addLiabilityButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = container.querySelector('input[placeholder="Account name (e.g., Credit Card, Mortgage, Student Loan)"]');
    expect(input).toBeTruthy();

    act(() => {
      Simulate.change(input, { target: { value: 'Test Liability' } });
    });

    const saveButton = container.querySelector('button[aria-label="Save liability"]');
    expect(saveButton).toBeTruthy();

    await act(async () => {
      saveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockAddAccount).toHaveBeenCalledWith('Test Liability', 'liability');
  });
});
