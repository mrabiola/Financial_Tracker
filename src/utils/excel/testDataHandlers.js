export class TestDataHandlers {
  constructor() {
    this.testFiles = new Map();
    this.testScenarios = new Map();
    this.validationRules = new Map();
    this.initializeTestData();
  }

  initializeTestData() {
    // Bank Statement Test Data
    this.addTestScenario('bank_statement', {
      name: 'Bank Statement Import',
      description: 'Standard bank statement with Date, Description, Amount, Balance columns',
      data: [
        ['Date', 'Description', 'Amount', 'Balance'],
        ['2024-01-01', 'Starting Balance', '5000.00', '5000.00'],
        ['2024-01-02', 'Grocery Store', '-125.50', '4874.50'],
        ['2024-01-03', 'Salary Deposit', '3500.00', '8374.50'],
        ['2024-01-04', 'Electric Bill', '-89.25', '8285.25'],
        ['2024-01-05', 'ATM Withdrawal', '-100.00', '8185.25']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: null, // Will be derived from file name or constant
        dateColumn: 0,
        valueColumn: 2,
        descriptionColumn: 1
      },
      expectedAccounts: 1,
      expectedTransactions: 5
    });

    // Net Worth Tracker Test Data
    this.addTestScenario('net_worth_monthly', {
      name: 'Monthly Net Worth Tracker',
      description: 'Account balances across 12 months',
      data: [
        ['Account', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ['Checking Account', '5000', '5200', '4800', '5100', '5300', '5000', '5400', '5200', '5100', '5300', '5500', '5800'],
        ['Savings Account', '15000', '15200', '15400', '15600', '15800', '16000', '16200', '16400', '16600', '16800', '17000', '17200'],
        ['401k', '45000', '46500', '44000', '47000', '48500', '49000', '51000', '52500', '50000', '53000', '54500', '56000'],
        ['Mortgage', '-250000', '-248500', '-247000', '-245500', '-244000', '-242500', '-241000', '-239500', '-238000', '-236500', '-235000', '-233500'],
        ['Credit Card', '-2500', '-1800', '-2200', '-1500', '-1900', '-2100', '-1700', '-2000', '-1600', '-1400', '-1800', '-1200']
      ],
      expectedMapping: {
        structure: 'monthly',
        accountColumn: 0,
        monthColumns: {
          0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6,
          6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12
        }
      },
      expectedAccounts: 5,
      expectedTransactions: 60 // 5 accounts × 12 months
    });

    // Quicken Export Test Data
    this.addTestScenario('quicken_export', {
      name: 'Quicken Export Format',
      description: 'Standard Quicken export with Account, Amount, Category',
      data: [
        ['Account', 'Amount', 'Category', 'Date'],
        ['Checking', '3500.00', 'Salary', '2024-01-01'],
        ['Checking', '-125.50', 'Groceries', '2024-01-02'],
        ['Savings', '500.00', 'Transfer', '2024-01-03'],
        ['Credit Card', '-89.25', 'Utilities', '2024-01-04'],
        ['Investment', '1000.00', 'Dividend', '2024-01-05']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 1,
        categoryColumn: 2,
        dateColumn: 3
      },
      expectedAccounts: 4,
      expectedTransactions: 5
    });

    // Mint Export Test Data
    this.addTestScenario('mint_export', {
      name: 'Mint.com Export Format',
      description: 'Mint export with comprehensive transaction details',
      data: [
        ['Date', 'Description', 'Original Description', 'Amount', 'Transaction Type', 'Category', 'Account Name', 'Labels', 'Notes'],
        ['1/1/2024', 'Starbucks', 'STARBUCKS STORE #1234', '-4.50', 'debit', 'Coffee Shops', 'Chase Checking', '', ''],
        ['1/2/2024', 'Salary', 'ACME CORP PAYROLL', '3500.00', 'credit', 'Paycheck', 'Chase Checking', '', ''],
        ['1/3/2024', 'Grocery Store', 'WHOLE FOODS MARKET', '-125.30', 'debit', 'Groceries', 'Chase Checking', '', ''],
        ['1/4/2024', 'Transfer', 'TRANSFER TO SAVINGS', '-500.00', 'debit', 'Transfer', 'Chase Checking', '', ''],
        ['1/4/2024', 'Transfer', 'TRANSFER FROM CHECKING', '500.00', 'credit', 'Transfer', 'Chase Savings', '', '']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: 6,
        valueColumn: 3,
        categoryColumn: 5,
        dateColumn: 0,
        descriptionColumn: 1
      },
      expectedAccounts: 2,
      expectedTransactions: 5
    });

    // Personal Capital Export Test Data
    this.addTestScenario('personal_capital', {
      name: 'Personal Capital Export',
      description: 'Personal Capital account summary export',
      data: [
        ['Account', 'Institution', 'Balance', 'Type', 'Category'],
        ['Chase Total Checking', 'Chase', '5234.56', 'Cash', 'Cash and Cash Equivalents'],
        ['Chase Savings', 'Chase', '15678.90', 'Cash', 'Cash and Cash Equivalents'],
        ['Vanguard 401k', 'Vanguard', '87543.21', 'Investment', 'Retirement'],
        ['Mortgage', 'Wells Fargo', '-234567.89', 'Liability', 'Real Estate'],
        ['Chase Freedom', 'Chase', '-1234.56', 'Credit Card', 'Credit Cards']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 2,
        categoryColumn: 4,
        typeColumn: 3
      },
      expectedAccounts: 5,
      expectedTransactions: 5
    });

    // Complex Hierarchical Test Data
    this.addTestScenario('hierarchical_budget', {
      name: 'Hierarchical Budget Structure',
      description: 'Budget with categories and subcategories',
      data: [
        ['Category', 'Budgeted', 'Actual', 'Difference'],
        ['Income', '', '', ''],
        ['  Salary', '5000.00', '5000.00', '0.00'],
        ['  Freelance', '1000.00', '1200.00', '200.00'],
        ['Expenses', '', '', ''],
        ['  Housing', '', '', ''],
        ['    Rent', '1500.00', '1500.00', '0.00'],
        ['    Utilities', '200.00', '185.50', '14.50'],
        ['  Transportation', '', '', ''],
        ['    Gas', '300.00', '275.80', '24.20'],
        ['    Insurance', '150.00', '150.00', '0.00'],
        ['  Food', '', '', ''],
        ['    Groceries', '400.00', '425.30', '-25.30'],
        ['    Dining Out', '200.00', '180.45', '19.55']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 2, // Actual values
        budgetColumn: 1
      },
      expectedAccounts: 8, // Only leaf nodes
      expectedTransactions: 8
    });

    // Multi-Currency Test Data
    this.addTestScenario('multi_currency', {
      name: 'Multi-Currency Accounts',
      description: 'Accounts with different currencies',
      data: [
        ['Account', 'Amount', 'Currency', 'USD Equivalent'],
        ['US Checking', '$5,234.56', 'USD', '5234.56'],
        ['UK Savings', '£3,456.78', 'GBP', '4321.02'],
        ['EU Investment', '€2,345.67', 'EUR', '2567.89'],
        ['JP Savings', '¥234,567', 'JPY', '1876.54'],
        ['CA Checking', 'C$1,876.54', 'CAD', '1398.76']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 3, // Use USD equivalent
        currencyColumn: 2
      },
      expectedAccounts: 5,
      expectedTransactions: 5
    });

    // Edge Cases Test Data
    this.addTestScenario('edge_cases', {
      name: 'Edge Cases and Error Conditions',
      description: 'Various edge cases for robust testing',
      data: [
        ['Account', 'Amount', 'Notes'],
        ['Normal Account', '1000.00', 'Standard case'],
        ['', '500.00', 'Missing account name'],
        ['Account with (parentheses)', '(250.00)', 'Negative in parentheses'],
        ['Account with $symbols$', '$1,234.56', 'Currency symbols'],
        ['Unicode Account 测试', '750.00', 'Unicode characters'],
        ['Very Long Account Name That Exceeds Normal Limits And Contains Many Words', '2000.00', 'Long name test'],
        ['Account with\nNewline', '300.00', 'Newline character'],
        ['Account\twith\ttabs', '400.00', 'Tab characters'],
        ['NULL', null, 'Null value'],
        ['Empty String', '', 'Empty amount'],
        ['Text Amount', 'not a number', 'Invalid amount']
      ],
      expectedMapping: {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 1,
        notesColumn: 2
      },
      expectedAccounts: 9, // Only valid accounts
      expectedTransactions: 9,
      expectedErrors: 3 // Missing name, null, invalid amount
    });
  }

  addTestScenario(key, scenario) {
    this.testScenarios.set(key, scenario);
  }

  getTestScenario(key) {
    return this.testScenarios.get(key);
  }

  getAllTestScenarios() {
    return Array.from(this.testScenarios.entries()).map(([key, scenario]) => ({
      key,
      ...scenario
    }));
  }

  // Generate test Excel file
  async generateTestFile(scenarioKey, format = 'xlsx') {
    const scenario = this.getTestScenario(scenarioKey);
    if (!scenario) {
      throw new Error(`Test scenario '${scenarioKey}' not found`);
    }

    // Import XLSX for file generation
    const XLSX = await import('xlsx');
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(scenario.data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate file buffer
    const wbout = XLSX.write(wb, { 
      bookType: format, 
      type: 'array',
      compression: true 
    });
    
    // Create File object
    const blob = new Blob([wbout], { 
      type: format === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel'
    });
    
    const file = new File([blob], `${scenarioKey}_test.${format}`, {
      type: blob.type,
      lastModified: Date.now()
    });
    
    // Cache the file
    this.testFiles.set(scenarioKey, file);
    
    return file;
  }

  // Run comprehensive tests
  async runAllTests(importEngine) {
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    for (const [key, scenario] of this.testScenarios) {
      results.total++;
      
      try {
        const testResult = await this.runSingleTest(key, scenario, importEngine);
        
        if (testResult.passed) {
          results.passed++;
        } else {
          results.failed++;
          results.errors.push({
            scenario: key,
            error: testResult.error,
            details: testResult.details
          });
        }
        
        results.details.push({
          scenario: key,
          ...testResult
        });
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          scenario: key,
          error: error.message,
          stack: error.stack
        });
      }
    }

    return results;
  }

  async runSingleTest(scenarioKey, scenario, importEngine) {
    const result = {
      scenario: scenarioKey,
      passed: false,
      error: null,
      details: {},
      timing: {}
    };

    try {
      const startTime = Date.now();
      
      // Generate test file
      const file = await this.generateTestFile(scenarioKey);
      result.timing.fileGeneration = Date.now() - startTime;
      
      // Run import process
      const importStart = Date.now();
      const importResult = await importEngine.processFile(file);
      result.timing.import = Date.now() - importStart;
      
      // Validate results
      const validationStart = Date.now();
      const validation = this.validateImportResult(importResult, scenario);
      result.timing.validation = Date.now() - validationStart;
      
      result.details = {
        importResult,
        validation,
        expectedAccounts: scenario.expectedAccounts,
        expectedTransactions: scenario.expectedTransactions,
        actualAccounts: importResult.accounts?.length || 0,
        actualTransactions: importResult.transactions?.length || 0
      };
      
      result.passed = validation.isValid;
      if (!validation.isValid) {
        result.error = validation.errors.join('; ');
      }
      
    } catch (error) {
      result.error = error.message;
      result.passed = false;
    }

    return result;
  }

  validateImportResult(importResult, scenario) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check if import was successful
    if (!importResult.success) {
      validation.isValid = false;
      validation.errors.push('Import failed: ' + (importResult.error || 'Unknown error'));
      return validation;
    }

    // Validate account count
    if (scenario.expectedAccounts !== undefined) {
      const actualAccounts = importResult.accounts?.length || 0;
      if (actualAccounts !== scenario.expectedAccounts) {
        validation.errors.push(
          `Account count mismatch: expected ${scenario.expectedAccounts}, got ${actualAccounts}`
        );
      }
    }

    // Validate transaction count
    if (scenario.expectedTransactions !== undefined) {
      const actualTransactions = importResult.transactions?.length || 0;
      if (actualTransactions !== scenario.expectedTransactions) {
        validation.errors.push(
          `Transaction count mismatch: expected ${scenario.expectedTransactions}, got ${actualTransactions}`
        );
      }
    }

    // Validate expected errors
    if (scenario.expectedErrors !== undefined) {
      const actualErrors = importResult.errors?.length || 0;
      if (actualErrors < scenario.expectedErrors) {
        validation.warnings.push(
          `Expected ${scenario.expectedErrors} errors, but only got ${actualErrors}`
        );
      }
    }

    // Validate mapping detection
    if (scenario.expectedMapping) {
      const detectedMapping = importResult.mapping || {};
      
      // Check structure
      if (scenario.expectedMapping.structure !== detectedMapping.structure) {
        validation.errors.push(
          `Structure mismatch: expected ${scenario.expectedMapping.structure}, got ${detectedMapping.structure}`
        );
      }
      
      // Check key column mappings
      const keyMappings = ['accountColumn', 'valueColumn', 'dateColumn', 'categoryColumn'];
      keyMappings.forEach(key => {
        if (scenario.expectedMapping[key] !== undefined && 
            scenario.expectedMapping[key] !== detectedMapping[key]) {
          validation.warnings.push(
            `Mapping ${key}: expected ${scenario.expectedMapping[key]}, got ${detectedMapping[key]}`
          );
        }
      });
    }

    // Validate data quality
    if (importResult.accounts) {
      importResult.accounts.forEach((account, index) => {
        if (!account.name || account.name.trim() === '') {
          validation.errors.push(`Account ${index} has no name`);
        }
        
        if (!account.type || !['asset', 'liability'].includes(account.type)) {
          validation.warnings.push(`Account ${index} has invalid type: ${account.type}`);
        }
      });
    }

    if (importResult.transactions) {
      importResult.transactions.forEach((transaction, index) => {
        if (!transaction.accountId) {
          validation.errors.push(`Transaction ${index} has no account ID`);
        }
        
        if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
          validation.errors.push(`Transaction ${index} has invalid amount: ${transaction.amount}`);
        }
      });
    }

    validation.isValid = validation.errors.length === 0;
    return validation;
  }

  // Generate performance test data
  generateLargeDataset(rows = 10000, columns = 12) {
    const data = [];
    
    // Headers
    const headers = ['Account'];
    for (let i = 0; i < columns - 1; i++) {
      headers.push(`Month_${i + 1}`);
    }
    data.push(headers);
    
    // Data rows
    for (let i = 0; i < rows; i++) {
      const row = [`Account_${i.toString().padStart(5, '0')}`];
      
      for (let j = 0; j < columns - 1; j++) {
        // Generate realistic financial data
        const baseAmount = Math.random() * 100000;
        const variation = (Math.random() - 0.5) * 10000;
        const amount = Math.round((baseAmount + variation) * 100) / 100;
        row.push(amount.toString());
      }
      
      data.push(row);
    }
    
    return data;
  }

  async runPerformanceTest(importEngine, rows = 10000) {
    const scenario = {
      name: `Performance Test (${rows} rows)`,
      data: this.generateLargeDataset(rows),
      expectedMapping: {
        structure: 'monthly',
        accountColumn: 0
      },
      expectedAccounts: rows,
      expectedTransactions: rows * 11 // 11 months of data
    };

    const startTime = Date.now();
    const result = await this.runSingleTest('performance_test', scenario, importEngine);
    const totalTime = Date.now() - startTime;
    
    return {
      ...result,
      totalTime,
      rowsPerSecond: rows / (totalTime / 1000),
      performance: {
        memoryUsage: this.estimateMemoryUsage(scenario.data),
        processingTime: totalTime,
        throughput: `${Math.round(rows / (totalTime / 1000))} rows/second`
      }
    };
  }

  estimateMemoryUsage(data) {
    // Rough estimation of memory usage
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  // Stress testing
  async runStressTest(importEngine) {
    const stressTests = [
      { name: 'Small Dataset', rows: 100 },
      { name: 'Medium Dataset', rows: 1000 },
      { name: 'Large Dataset', rows: 10000 },
      { name: 'Very Large Dataset', rows: 50000 }
    ];

    const results = [];
    
    for (const test of stressTests) {
      try {
        const result = await this.runPerformanceTest(importEngine, test.rows);
        results.push({
          testName: test.name,
          rows: test.rows,
          success: result.passed,
          time: result.totalTime,
          throughput: result.performance.throughput,
          memoryUsage: result.performance.memoryUsage
        });
      } catch (error) {
        results.push({
          testName: test.name,
          rows: test.rows,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Export test results
  exportTestResults(results, format = 'json') {
    const timestamp = new Date().toISOString();
    const exportData = {
      timestamp,
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        successRate: `${Math.round((results.passed / results.total) * 100)}%`
      },
      details: results.details,
      errors: results.errors
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return this.convertToCsv(exportData);
    }
    
    return exportData;
  }

  convertToCsv(data) {
    const headers = ['Scenario', 'Status', 'Expected Accounts', 'Actual Accounts', 'Expected Transactions', 'Actual Transactions', 'Error'];
    const rows = [headers.join(',')];
    
    data.details.forEach(detail => {
      const row = [
        detail.scenario,
        detail.passed ? 'PASS' : 'FAIL',
        detail.details.expectedAccounts || '',
        detail.details.actualAccounts || '',
        detail.details.expectedTransactions || '',
        detail.details.actualTransactions || '',
        detail.error || ''
      ];
      rows.push(row.map(cell => `"${cell}"`).join(','));
    });
    
    return rows.join('\n');
  }

  // Clean up test files
  cleanup() {
    this.testFiles.clear();
  }
}

export default TestDataHandlers;