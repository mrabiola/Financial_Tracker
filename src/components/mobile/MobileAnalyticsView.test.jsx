import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

global.IS_REACT_ACT_ENVIRONMENT = true;

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

jest.mock('recharts', () => {
  const React = require('react');
  const Container = ({ children }) => <div>{children}</div>;
  const MockChart = () => <div />;

  return {
    ResponsiveContainer: Container,
    AreaChart: MockChart,
    Area: MockChart,
    ComposedChart: MockChart,
    XAxis: MockChart,
    YAxis: MockChart,
    Tooltip: MockChart,
    PieChart: MockChart,
    Pie: MockChart,
    Cell: MockChart,
    CartesianGrid: MockChart,
    BarChart: MockChart,
    Bar: MockChart,
    LineChart: MockChart,
    Line: MockChart,
    ReferenceArea: MockChart,
    Legend: MockChart
  };
});

const MobileAnalyticsView = require('./MobileAnalyticsView').default;

describe('MobileAnalyticsView', () => {
  let container;
  let root;

  const baseProps = {
    selectedYear: 2025,
    selectedMonth: 0,
    setSelectedMonth: jest.fn(),
    setSelectedYear: jest.fn(),
    accounts: {
      assets: [{ id: 'asset-1', name: 'Cash' }],
      liabilities: [{ id: 'liability-1', name: 'Loan' }]
    },
    goals: [],
    getSnapshotValue: (id) => (id === 'asset-1' ? 1000 : 200),
    formatCurrency: (value) => `$${value}`,
    getCurrencySymbol: () => '$',
    currency: 'USD',
    multiYearData: {},
    healthTrend: [],
    healthSettings: null
  };

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

  it('renders the net worth analytics view by default', () => {
    act(() => {
      root.render(<MobileAnalyticsView {...baseProps} />);
    });

    expect(container.textContent).toContain('Net Worth Analytics');
    expect(container.textContent).toContain('Progression');
    expect(container.textContent).toContain('Comparison');
  });

  it('switches to comparison controls when toggled', () => {
    act(() => {
      root.render(<MobileAnalyticsView {...baseProps} />);
    });

    const comparisonButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Comparison')
    );

    expect(comparisonButton).toBeTruthy();

    act(() => {
      comparisonButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('3Y');
    expect(container.textContent).not.toContain('3M');
  });

  it('returns to progression controls after toggling back', () => {
    act(() => {
      root.render(<MobileAnalyticsView {...baseProps} />);
    });

    const comparisonButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Comparison')
    );
    const progressionButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Progression')
    );

    act(() => {
      comparisonButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    act(() => {
      progressionButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('3M');
    expect(container.textContent).not.toContain('3Y');
  });

  it('shows the health section when the health tab is selected', () => {
    act(() => {
      root.render(<MobileAnalyticsView {...baseProps} />);
    });

    const healthButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Health')
    );

    act(() => {
      healthButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Financial Health');
  });
});
