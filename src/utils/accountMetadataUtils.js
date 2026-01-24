import {
  MapPin,
  Building,
  Car,
  TrendingUp,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Home,
  Percent,
  Hash
} from 'lucide-react';

/**
 * Account category types for metadata field mapping
 */
export const ACCOUNT_CATEGORIES = {
  PROPERTY: 'property',
  VEHICLE: 'vehicle',
  INVESTMENT: 'investment',
  BANKING: 'banking',
  CREDIT: 'credit',
  LOAN: 'loan',
  GENERAL: 'general'
};

/**
 * Detect account category from account name for field suggestions
 * @param {string} accountName - The account name
 * @param {string} accountType - 'asset' or 'liability'
 * @returns {string} - Account category
 */
export function detectAccountCategory(accountName, accountType) {
  const name = accountName.toLowerCase();

  // Property keywords
  if (name.includes('house') || name.includes('home') || name.includes('property') ||
      name.includes('condo') || name.includes('apartment') || name.includes('real estate') ||
      name.includes('rental') || name.includes('land')) {
    return ACCOUNT_CATEGORIES.PROPERTY;
  }

  // Vehicle keywords
  if (name.includes('car') || /\bcar\b/.test(name) || name.includes('auto') ||
      name.includes('vehicle') || name.includes('truck') || name.includes('motorcycle') ||
      name.includes('suv') || name.includes('van')) {
    return ACCOUNT_CATEGORIES.VEHICLE;
  }

  // Investment keywords
  if (name.includes('invest') || name.includes('stock') || name.includes('ira') ||
      name.includes('401k') || name.includes('401(k') || name.includes('roth') ||
      name.includes('brokerage') || name.includes('etf') || name.includes('crypto') ||
      name.includes('robin') || name.includes('fidelity') || name.includes('vanguard')) {
    return ACCOUNT_CATEGORIES.INVESTMENT;
  }

  // Banking keywords
  if (name.includes('checking') || name.includes('saving') || name.includes('bank') ||
      name.includes('credit union') || name.includes('cash') || name.includes('emergency')) {
    return ACCOUNT_CATEGORIES.BANKING;
  }

  // Credit card keywords
  if (name.includes('credit') || /\bcard\b/.test(name) || name.includes('amex') ||
      name.includes('visa') || name.includes('mastercard')) {
    return ACCOUNT_CATEGORIES.CREDIT;
  }

  // Loan keywords
  if (name.includes('loan') || name.includes('mortgage') || name.includes('student') ||
      name.includes('personal loan') || name.includes('auto loan') || name.includes('debt')) {
    return ACCOUNT_CATEGORIES.LOAN;
  }

  return ACCOUNT_CATEGORIES.GENERAL;
}

/**
 * Get metadata field definitions for an account category
 * @param {string} category - Account category
 * @returns {Array} - Array of field definitions
 */
export function getMetadataFields(category) {
  const baseFields = [
    {
      key: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Add any additional notes...',
      icon: FileText
    }
  ];

  const categoryFields = {
    [ACCOUNT_CATEGORIES.PROPERTY]: [
      {
        key: 'address',
        label: 'Address',
        type: 'text',
        placeholder: '123 Main St',
        icon: MapPin
      },
      {
        key: 'cityStateZip',
        label: 'City, State ZIP',
        type: 'text',
        placeholder: 'Springfield, IL 62701',
        icon: MapPin
      },
      {
        key: 'lender',
        label: 'Lender',
        type: 'text',
        placeholder: 'Wells Fargo, Bank of America...',
        icon: Building
      },
      {
        key: 'purchasePrice',
        label: 'Purchase Price',
        type: 'number',
        placeholder: '450000',
        icon: DollarSign
      },
      {
        key: 'purchaseDate',
        label: 'Purchase Date',
        type: 'date',
        placeholder: 'YYYY-MM-DD',
        icon: Calendar
      },
      {
        key: 'propertyType',
        label: 'Property Type',
        type: 'select',
        options: ['primary', 'rental', 'investment', 'vacation', 'land'],
        placeholder: 'Select type...',
        icon: Home
      }
    ],

    [ACCOUNT_CATEGORIES.VEHICLE]: [
      {
        key: 'make',
        label: 'Make',
        type: 'text',
        placeholder: 'Toyota, Honda, Ford...',
        icon: Car
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'Camry, Civic, F-150...',
        icon: Car
      },
      {
        key: 'year',
        label: 'Year',
        type: 'number',
        placeholder: '2020',
        icon: Calendar
      },
      {
        key: 'vin',
        label: 'VIN',
        type: 'text',
        placeholder: 'Vehicle Identification Number',
        icon: Hash
      },
      {
        key: 'lender',
        label: 'Lender',
        type: 'text',
        placeholder: 'Toyota Financial, bank...',
        icon: Building
      },
      {
        key: 'purchaseDate',
        label: 'Purchase Date',
        type: 'date',
        placeholder: 'YYYY-MM-DD',
        icon: Calendar
      }
    ],

    [ACCOUNT_CATEGORIES.INVESTMENT]: [
      {
        key: 'ticker',
        label: 'Ticker Symbol',
        type: 'text',
        placeholder: 'AAPL, VTI, BTC...',
        icon: TrendingUp
      },
      {
        key: 'shares',
        label: 'Shares/Units',
        type: 'number',
        placeholder: '100',
        icon: Hash
      },
      {
        key: 'custodian',
        label: 'Custodian/Broker',
        type: 'text',
        placeholder: 'Fidelity, Vanguard, Robinhood...',
        icon: Building
      },
      {
        key: 'accountType',
        label: 'Account Type',
        type: 'select',
        options: ['401k', 'ira', 'roth_ira', 'brokerage', 'crypto', 'hisa', 'other'],
        placeholder: 'Select type...',
        icon: Briefcase
      }
    ],

    [ACCOUNT_CATEGORIES.BANKING]: [
      {
        key: 'bankName',
        label: 'Bank Name',
        type: 'text',
        placeholder: 'Chase, Bank of America...',
        icon: Building
      },
      {
        key: 'accountNumber',
        label: 'Account Number (Last 4)',
        type: 'text',
        placeholder: '1234',
        icon: Hash
      },
      {
        key: 'interestRate',
        label: 'Interest Rate (%)',
        type: 'number',
        placeholder: '4.5',
        icon: Percent
      }
    ],

    [ACCOUNT_CATEGORIES.CREDIT]: [
      {
        key: 'last4',
        label: 'Last 4 Digits',
        type: 'text',
        placeholder: '1234',
        icon: CreditCard
      },
      {
        key: 'bank',
        label: 'Bank/Issuer',
        type: 'text',
        placeholder: 'Chase, Amex, Citi...',
        icon: Building
      },
      {
        key: 'limit',
        label: 'Credit Limit',
        type: 'number',
        placeholder: '10000',
        icon: DollarSign
      },
      {
        key: 'apr',
        label: 'APR (%)',
        type: 'number',
        placeholder: '18.99',
        icon: Percent
      },
      {
        key: 'dueDate',
        label: 'Payment Due Date',
        type: 'number',
        placeholder: '15',
        icon: Calendar,
        min: 1,
        max: 31
      }
    ],

    [ACCOUNT_CATEGORIES.LOAN]: [
      {
        key: 'lender',
        label: 'Lender',
        type: 'text',
        placeholder: 'Bank, credit union...',
        icon: Building
      },
      {
        key: 'originalAmount',
        label: 'Original Amount',
        type: 'number',
        placeholder: '250000',
        icon: DollarSign
      },
      {
        key: 'interestRate',
        label: 'Interest Rate (%)',
        type: 'number',
        placeholder: '6.5',
        icon: Percent
      },
      {
        key: 'term',
        label: 'Term (Years)',
        type: 'number',
        placeholder: '30',
        icon: Calendar
      },
      {
        key: 'payoffDate',
        label: 'Payoff Date',
        type: 'date',
        placeholder: 'YYYY-MM-DD',
        icon: Calendar
      }
    ],

    [ACCOUNT_CATEGORIES.GENERAL]: [
      {
        key: 'category',
        label: 'Category',
        type: 'text',
        placeholder: 'e.g., Emergency Fund, Entertainment...',
        icon: Hash
      }
    ]
  };

  return [...(categoryFields[category] || []), ...baseFields];
}

/**
 * Validate metadata structure
 * @param {Object} metadata - Metadata to validate
 * @param {string} category - Account category
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export function validateMetadata(metadata, category) {
  const errors = [];

  if (!metadata || typeof metadata !== 'object') {
    return { valid: false, errors: ['Metadata must be an object'] };
  }

  // Validate number fields
  const numberFields = {
    [ACCOUNT_CATEGORIES.PROPERTY]: ['purchasePrice'],
    [ACCOUNT_CATEGORIES.VEHICLE]: ['year'],
    [ACCOUNT_CATEGORIES.INVESTMENT]: ['shares'],
    [ACCOUNT_CATEGORIES.BANKING]: ['interestRate'],
    [ACCOUNT_CATEGORIES.CREDIT]: ['limit', 'apr', 'dueDate'],
    [ACCOUNT_CATEGORIES.LOAN]: ['originalAmount', 'interestRate', 'term']
  };

  const fieldsToValidate = numberFields[category] || [];

  fieldsToValidate.forEach(field => {
    const value = metadata[field];
    if (value !== undefined && value !== null && value !== '') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        errors.push(`${field} must be a valid number`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Format metadata for display
 * @param {Object} metadata - Account metadata
 * @param {string} category - Account category
 * @returns {Array} - Array of { label, value, icon } for display
 */
export function formatMetadataForDisplay(metadata, category) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return [];
  }

  const fields = getMetadataFields(category);
  const displayItems = [];

  const labelMap = {
    address: 'Address',
    cityStateZip: 'Location',
    lender: 'Lender',
    purchasePrice: 'Purchase Price',
    purchaseDate: 'Purchased',
    propertyType: 'Type',
    make: 'Make',
    model: 'Model',
    year: 'Year',
    vin: 'VIN',
    ticker: 'Ticker',
    shares: 'Shares',
    custodian: 'Custodian',
    accountType: 'Account Type',
    bankName: 'Bank',
    accountNumber: 'Account',
    interestRate: 'Rate',
    last4: 'Last 4',
    bank: 'Bank',
    limit: 'Limit',
    apr: 'APR',
    dueDate: 'Due Day',
    originalAmount: 'Original',
    term: 'Term',
    payoffDate: 'Payoff',
    category: 'Category',
    notes: 'Notes'
  };

  const formatValue = (key, value) => {
    if (key === 'purchasePrice' || key === 'originalAmount' || key === 'limit' || key === 'shares') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (key === 'interestRate' || key === 'apr') {
      return `${value}%`;
    }
    if (key === 'propertyType') {
      const typeLabels = {
        primary: 'Primary Residence',
        rental: 'Rental Property',
        investment: 'Investment Property',
        vacation: 'Vacation Home',
        land: 'Land'
      };
      return typeLabels[value] || value;
    }
    if (key === 'accountType') {
      const typeLabels = {
        '401k': '401(k)',
        'ira': 'IRA',
        'roth_ira': 'Roth IRA',
        'brokerage': 'Brokerage',
        'crypto': 'Cryptocurrency',
        'hisa': 'High-Yield Savings',
        'other': 'Other'
      };
      return typeLabels[value] || value;
    }
    if (key === 'dueDate') {
      return `Day ${value}`;
    }
    return value;
  };

  fields.forEach(field => {
    const value = metadata[field.key];
    if (value !== undefined && value !== null && value !== '') {
      displayItems.push({
        key: field.key,
        label: labelMap[field.key] || field.label,
        value: formatValue(field.key, value),
        rawValue: value,
        icon: field.icon
      });
    }
  });

  return displayItems;
}

/**
 * Get display label for property type
 */
export function getPropertyTypeLabel(type) {
  const labels = {
    primary: 'Primary Residence',
    rental: 'Rental Property',
    investment: 'Investment Property',
    vacation: 'Vacation Home',
    land: 'Land'
  };
  return labels[type] || type;
}

/**
 * Get display label for investment account type
 */
export function getInvestmentTypeLabel(type) {
  const labels = {
    '401k': '401(k)',
    'ira': 'Traditional IRA',
    'roth_ira': 'Roth IRA',
    'brokerage': 'Brokerage Account',
    'crypto': 'Cryptocurrency',
    'hisa': 'High-Yield Savings',
    'other': 'Other Investment'
  };
  return labels[type] || type;
}
