# WealthTrak: Feature Development Plan

**Date:** 2026-01-24

**Focus Priority:**
1. **Refine existing features** (70% - fix UX issues, complete mobile parity)
2. **Add new features** (20% - investment tracking, recurring bills, search)
3. **Enhance current features** (10% - better analytics, reports)

---

## Part 1: Refine Existing Features (HIGH PRIORITY)

### 1.1 Fix Mobile-Desktop Feature Parity

**Problem:** Mobile has simplified/analytics views missing features that desktop has.

**Files to modify:**
- `src/components/mobile/MobileAnalyticsView.jsx`
- `src/components/mobile/MobileNetWorthView.jsx`
- `src/components/mobile/MobileCashflowView.jsx`

**Changes:**
| Feature | Desktop | Mobile | Action | Comment |
|---------|---------|--------|--------|---------|
| Analytics tabs | All chart types | Only basic | Add waterfall, trend charts | - This is not completely accurate. its not only basic. Maybe one or two more needed.|
| Time range filters | 1M, YTD, 3M, 6M, ALL | Missing | Add filter dropdown | |
| Goal editing | Full UI | Missing | Add edit/delete goals | |
| Bulk operations | Multi-select | Missing | Add swipe actions | |

### 1.2 Improve Loading States & Feedback

**Problem:** Users don't know what's happening during data loads.

**Files to create/modify:**
- `src/components/common/SkeletonLoader.jsx` (NEW)
- `src/components/common/LoadingState.jsx` (improve existing)
- `src/hooks/useFinancialData.js` - Add loading states

**Implementation:**
```jsx
// Skeleton loaders for:
// - Account cards
// - Goal progress bars
// - Chart containers
// - Table rows
```

### 1.3 Better Error Handling

**Problem:** Errors crash UI or show cryptic messages.

**Files to create/modify:**
- `src/components/common/ErrorBoundary.jsx` (NEW)
- `src/components/common/ErrorMessage.jsx` (NEW)
- `src/components/common/RetryButton.jsx` (NEW)
- `src/App.js` - Wrap app in ErrorBoundary

**Features:**
- Graceful error boundaries
- User-friendly error messages
- Retry buttons for failed operations
- Offline detection

### 1.4 Import/Export UX Improvements

**Problem:** Excel import is confusing, errors are technical.

**Files to modify:**
- `src/components/dashboard/SimpleImportModal.jsx`

**Improvements:**
- Add drag-and-drop file upload
- Show file preview before import
- Better validation error messages (what's wrong, which row)
- Progress indicator for large files
- Sample template download link

### 1.5 Touch Target & Gesture Improvements

**Problem:** Mobile interactions could be smoother.

**Files to modify:**
- `src/components/mobile/MobileNetWorthView.jsx`
- `src/components/mobile/MobileQuickEntry.jsx`
- `src/index.css`

**Improvements:**
- Ensure all touch targets ≥ 44px
- Add haptic feedback (Vibration API)
- Swipe-to-delete on account cards
- Pull-to-refresh on dashboard
- Better bottom sheet animations

### 1.6 Undo/Redo for Destructive Actions

**Problem:** Accidental deletes require re-entering data.

**Files to create/modify:**
- `src/contexts/UndoContext.jsx` (NEW)
- `src/components/common/UndoToast.jsx` (NEW)
- Add undo to: delete account, delete goal, clear data

**Implementation:**
```javascript
// Show toast: "Account deleted. Undo?"
// Store last action in context
// Restore on undo click
```

---

## Part 2: Add New Features (SECONDARY PRIORITY)

### 2.1 Investment Tracking

**Problem:** Millennials want to track investments, not just assets.

**Files to create:**
- `src/components/dashboard/InvestmentTracker.jsx` (NEW)
- `src/components/dashboard/PortfolioChart.jsx` (NEW)
- Supabase migration for investment_accounts table

**Features:**
- Stock/portfolio value tracking
- Asset allocation chart (stocks, real estate, cash, crypto)
- Manual entry or CSV import
- Gain/loss calculation
- Dividend tracking

**Data model:**
```sql
CREATE TABLE investment_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  type TEXT -- 'stocks', 'crypto', 'real_estate', 'other'
);
CREATE TABLE investment_values (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES investment_accounts(id),
  month DATE,
  value DECIMAL,
  cost_basis DECIMAL
);
```

### 2.2 Recurring Bills & Subscriptions

**Problem:** Users forget about subscriptions, want to track fixed expenses.

**Files to create:**
- `src/components/dashboard/BillsTracker.jsx` (NEW)
- `src/components/dashboard/AddBillModal.jsx` (NEW)
- Supabase migration for recurring_bills table

**Features:**
- Add recurring bills/subscriptions
- Monthly, quarterly, yearly frequency
- Next payment date countdown
- Total monthly commitment summary
- Payment history tracking

**Data model:**
```sql
CREATE TABLE recurring_bills (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  amount DECIMAL,
  currency TEXT,
  frequency TEXT, -- 'monthly', 'quarterly', 'yearly'
  category_id TEXT,
  next_payment_date DATE,
  active BOOLEAN DEFAULT true
);
```

### 2.3 Search & Filter

**Problem:** Hard to find specific accounts or goals in long lists.

**Files to create:**
- `src/components/common/SearchBar.jsx` (NEW)
- `src/components/common/FilterDropdown.jsx` (NEW)

**Implementation:**
- Search accounts by name
- Filter by type (asset vs liability)
- Filter goals by progress
- Recent searches quick access

### 2.4 Notifications & Milestones

**Problem:** Users want to be alerted about achievements and issues.

**Files to create:**
- `src/components/NotificationCenter.jsx` (NEW)
- `src/utils/notifications.js` (NEW)

**Notification types:**
- Goal reached celebrations
- Net worth milestone ($10K, $50K, $100K, etc.)
- Unusual spending detected
- Bill due reminders
- Monthly summary ready

### 2.5 Data Backup & Export Options

**Problem:** Users want more control over their data.

**Files to create:**
- `src/components/settings/DataExport.jsx` (NEW)
- `src/utils/exportBackup.js` (NEW)

**Features:**
- Export all data as JSON
- Export to Excel (improve existing)
- Email monthly backup
- Data visualization (PDF report)

---

## Part 3: Enhance Current Features (LOWER PRIORITY)

### 3.1 Better Analytics Dashboard

**Files to modify:**
- `src/components/dashboard/NetWorthTracker.jsx`
- `src/components/mobile/MobileAnalyticsView.jsx`

**Enhancements:**
- Net worth growth rate (month-over-month, year-over-year)
- Projected net worth (based on trend)
- Spending breakdown by category
- Income vs expense comparison
- Savings rate calculation

### 3.2 AI-Powered Insights

**You already have Gemini API - use it!**

**Files to create:**
- `src/components/dashboard/AIInsightsCard.jsx` (NEW)
- `src/utils/geminiInsights.js` (NEW)

**Features:**
- "You spent 15% less on dining this month"
- "At this rate, you'll reach your goal by July"
- "Your rent increased 20% - is this correct?"
- Monthly financial summary

### 3.3 Comparison Tools

**Files to create:**
- `src/components/dashboard/ComparisonView.jsx` (NEW)

**Features:**
- Compare net worth vs previous periods
- Side-by-side month comparison
- Category spending comparison
- Goal progress comparison

### 3.4 Improved Currency Features

**Leverage your existing multi-currency advantage**

**Files to modify:**
- `src/components/dashboard/NetWorthTracker.jsx`
- Currency display components

**Enhancements:**
- Show original vs converted value
- Currency conversion history
- Multi-currency net worth summary
- Currency strength indicator

---

## Implementation Order (Suggested)

### Sprint 1: UX Polish (Week 1)
1. ✅ Loading states & skeleton loaders
2. ✅ Error boundaries
3. ✅ Import modal improvements
4. ✅ Undo/redo for deletes
5. ✅ Touch target improvements

### Sprint 2: Mobile Parity (Week 2)
1. ✅ Complete mobile analytics
2. ✅ Add time range filters to mobile
3. ✅ Goal editing on mobile
4. ✅ Swipe gestures
5. ✅ Pull to refresh

### Sprint 3: New Features (Weeks 3-4)
1. ✅ Investment tracking
2. ✅ Recurring bills
3. ✅ Search & filter
4. ✅ Notifications

### Sprint 4: AI & Analytics (Week 5)
1. ✅ AI insights cards
2. ✅ Better analytics charts
3. ✅ Comparison tools
4. ✅ Enhanced currency features

---

## Files to Create Summary

### New Components
| File | Purpose |
|------|---------|
| `src/components/common/SkeletonLoader.jsx` | Loading placeholders |
| `src/components/common/ErrorBoundary.jsx` | Catch React errors |
| `src/components/common/UndoToast.jsx` | Undo destructive actions |
| `src/components/common/SearchBar.jsx` | Search functionality |
| `src/components/dashboard/InvestmentTracker.jsx` | Track investments |
| `src/components/dashboard/BillsTracker.jsx` | Recurring bills |
| `src/components/dashboard/AIInsightsCard.jsx` | AI-powered insights |
| `src/components/NotificationCenter.jsx` | Notification system |

### New Hooks/Utils
| File | Purpose |
|------|---------|
| `src/contexts/UndoContext.jsx` | Undo/redo state |
| `src/contexts/NotificationContext.jsx` | Notification state |
| `src/utils/geminiInsights.js` | AI insight generation |
| `src/utils/notifications.js` | Notification helpers |

### Database Migrations (Supabase)
| Migration | Purpose |
|-----------|---------|
| `investment_accounts` | Stock/portfolio tracking |
| `investment_values` | Historical investment data |
| `recurring_bills` | Subscription/bill tracking |
| `notifications` | User notifications |
| `add_environment_column` | Environment-based data isolation |

---

## Quick Wins (Can be done in 1-2 hours each)

1. **Undo toast** - High value, low complexity
2. **Skeleton loaders** - Huge UX improvement
3. **Error boundary** - Prevents app crashes
4. **Search bar** - Simple filter, high utility
5. **Touch target sizing** - CSS only, big mobile impact
6. **Pull to refresh** - Mobile gesture, feels premium
