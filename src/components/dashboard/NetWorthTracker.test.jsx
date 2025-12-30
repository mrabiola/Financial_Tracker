import React, { act } from 'react';
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

jest.mock('../../hooks/useFinancialDataDemo', () => ({
  useFinancialDataDemo: () => ({
    loading: false,
    error: null,
    accounts: { assets: [], liabilities: [] },
    goals: [],
    addAccount: jest.fn(),
    deleteAccount: jest.fn(),
    updateSnapshot: jest.fn(),
    addGoal: jest.fn(),
    updateGoalProgress: jest.fn(),
    deleteGoal: jest.fn(),
    getSnapshotValue: jest.fn(() => 0),
    getSnapshotCurrencyData: jest.fn(() => null),
    fetchMultiYearSnapshots: jest.fn(() => Promise.resolve({})),
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

jest.mock('../../hooks/useApiAssets', () => ({
  useApiAssets: () => ({ addApiAsset: jest.fn() })
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
jest.mock('./SmartAssetModal', () => () => <div>SmartAssetModal</div>);
jest.mock('./CashflowSection', () => () => <div>CashflowSection</div>);

const NetWorthTracker = require('./NetWorthTracker').default;

describe('NetWorthTracker', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
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
});
