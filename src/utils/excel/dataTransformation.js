export class DataTransformationPipeline {
  constructor() {
    this.transformers = new Map();
    this.validators = new Map();
    this.formatters = new Map();
    this.initializeTransformers();
  }

  initializeTransformers() {
    // Currency transformers
    this.transformers.set('currency', {
      parse: (value) => this.parseCurrency(value),
      validate: (value) => this.validateCurrency(value),
      format: (value) => this.formatCurrency(value)
    });

    // Date transformers
    this.transformers.set('date', {
      parse: (value) => this.parseDate(value),
      validate: (value) => this.validateDate(value),
      format: (value) => this.formatDate(value)
    });

    // Account name transformers
    this.transformers.set('account', {
      parse: (value) => this.parseAccountName(value),
      validate: (value) => this.validateAccountName(value),
      format: (value) => this.formatAccountName(value)
    });

    // Percentage transformers
    this.transformers.set('percentage', {
      parse: (value) => this.parsePercentage(value),
      validate: (value) => this.validatePercentage(value),
      format: (value) => this.formatPercentage(value)
    });

    // Account type transformers
    this.transformers.set('accountType', {
      parse: (value) => this.parseAccountType(value),
      validate: (value) => this.validateAccountType(value),
      format: (value) => this.formatAccountType(value)
    });
  }

  transformData(rawData, mapping, schema) {
    const pipeline = this.createPipeline(mapping, schema);
    const results = {
      accounts: [],
      transactions: [],
      metadata: {},
      errors: [],
      warnings: [],
      statistics: {}
    };

    try {
      const processedData = this.executeTransformationPipeline(rawData, pipeline);
      
      // Convert to app schema
      results.accounts = this.generateAccounts(processedData, schema);
      results.transactions = this.generateTransactions(processedData, schema);
      results.metadata = this.generateMetadata(rawData, processedData, schema);
      results.statistics = this.generateStatistics(processedData);

      // Validate results
      this.validateResults(results);

    } catch (error) {
      results.errors.push({
        type: 'transformation',
        message: error.message,
        timestamp: new Date()
      });
    }

    return results;
  }

  createPipeline(mapping, schema) {
    const pipeline = {
      steps: [],
      rules: [],
      transformations: []
    };

    // Data extraction step
    pipeline.steps.push({
      name: 'extract',
      config: mapping,
      transformer: this.createDataExtractor(mapping)
    });

    // Data cleaning step
    pipeline.steps.push({
      name: 'clean',
      config: schema.cleaningRules || {},
      transformer: this.createDataCleaner()
    });

    // Data validation step
    pipeline.steps.push({
      name: 'validate',
      config: schema.validationRules || {},
      transformer: this.createDataValidator()
    });

    // Data enrichment step
    pipeline.steps.push({
      name: 'enrich',
      config: schema.enrichmentRules || {},
      transformer: this.createDataEnricher()
    });

    // Data normalization step
    pipeline.steps.push({
      name: 'normalize',
      config: schema.normalizationRules || {},
      transformer: this.createDataNormalizer()
    });

    return pipeline;
  }

  executeTransformationPipeline(rawData, pipeline) {
    let currentData = rawData;

    for (const step of pipeline.steps) {
      try {
        currentData = step.transformer(currentData, step.config);
      } catch (error) {
        throw new Error(`Transformation failed at step ${step.name}: ${error.message}`);
      }
    }

    return currentData;
  }

  createDataExtractor(mapping) {
    return (rawData, config) => {
      const extracted = [];
      
      if (!rawData.data || rawData.data.length === 0) {
        throw new Error('No data to extract');
      }

      // const headers = rawData.data[0];
      const dataRows = rawData.data.slice(1);

      if (mapping.structure === 'single') {
        // Single value per row extraction
        dataRows.forEach((row, index) => {
          const item = {
            rowIndex: index + 1,
            rawRow: row,
            accountName: null,
            value: null,
            category: null,
            date: null,
            type: null
          };

          if (mapping.accountColumn !== null && row[mapping.accountColumn] !== undefined) {
            item.accountName = row[mapping.accountColumn];
          }

          if (mapping.valueColumn !== null && row[mapping.valueColumn] !== undefined) {
            item.value = row[mapping.valueColumn];
          }

          if (mapping.categoryColumn !== null && row[mapping.categoryColumn] !== undefined) {
            item.category = row[mapping.categoryColumn];
          }

          if (mapping.dateColumn !== null && row[mapping.dateColumn] !== undefined) {
            item.date = row[mapping.dateColumn];
          }

          if (mapping.typeColumn !== null && row[mapping.typeColumn] !== undefined) {
            item.type = row[mapping.typeColumn];
          }

          extracted.push(item);
        });

      } else if (mapping.structure === 'monthly') {
        // Monthly columns extraction
        dataRows.forEach((row, index) => {
          const baseItem = {
            rowIndex: index + 1,
            rawRow: row,
            accountName: null,
            monthlyData: {},
            type: null
          };

          if (mapping.accountColumn !== null && row[mapping.accountColumn] !== undefined) {
            baseItem.accountName = row[mapping.accountColumn];
          }

          if (mapping.typeColumn !== null && row[mapping.typeColumn] !== undefined) {
            baseItem.type = row[mapping.typeColumn];
          }

          // Extract monthly values
          if (mapping.monthColumns) {
            Object.entries(mapping.monthColumns).forEach(([monthIndex, columnIndex]) => {
              if (row[columnIndex] !== undefined && row[columnIndex] !== null) {
                baseItem.monthlyData[monthIndex] = row[columnIndex];
              }
            });
          }

          extracted.push(baseItem);
        });
      }

      return extracted;
    };
  }

  createDataCleaner() {
    return (data, config) => {
      return data.map(item => {
        const cleaned = { ...item };

        // Clean account names
        if (cleaned.accountName) {
          cleaned.accountName = this.cleanText(cleaned.accountName);
        }

        // Clean values
        if (cleaned.value !== null) {
          cleaned.value = this.cleanNumericValue(cleaned.value);
        }

        // Clean monthly data
        if (cleaned.monthlyData) {
          Object.keys(cleaned.monthlyData).forEach(month => {
            cleaned.monthlyData[month] = this.cleanNumericValue(cleaned.monthlyData[month]);
          });
        }

        // Clean categories
        if (cleaned.category) {
          cleaned.category = this.cleanText(cleaned.category);
        }

        // Clean dates
        if (cleaned.date) {
          cleaned.date = this.cleanDate(cleaned.date);
        }

        return cleaned;
      });
    };
  }

  createDataValidator() {
    return (data, config) => {
      return data.map(item => {
        const validated = { ...item, validationErrors: [] };

        // Validate account name
        if (!this.validateAccountName(validated.accountName)) {
          validated.validationErrors.push('Invalid or missing account name');
        }

        // Validate values
        if (validated.value !== null && !this.validateCurrency(validated.value)) {
          validated.validationErrors.push('Invalid value format');
        }

        // Validate monthly data
        if (validated.monthlyData) {
          Object.entries(validated.monthlyData).forEach(([month, value]) => {
            if (!this.validateCurrency(value)) {
              validated.validationErrors.push(`Invalid value for month ${month}`);
            }
          });
        }

        // Validate dates
        if (validated.date && !this.validateDate(validated.date)) {
          validated.validationErrors.push('Invalid date format');
        }

        return validated;
      });
    };
  }

  createDataEnricher() {
    return (data, config) => {
      return data.map(item => {
        const enriched = { ...item };

        // Auto-detect account type if not provided
        if (!enriched.type && enriched.accountName) {
          enriched.type = this.detectAccountType(enriched.accountName);
          enriched.autoDetectedType = true;
        }

        // Standardize account categories
        if (enriched.category) {
          enriched.standardizedCategory = this.standardizeCategory(enriched.category);
        }

        // Add calculated fields
        if (enriched.monthlyData) {
          enriched.totalValue = Object.values(enriched.monthlyData)
            .reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
          enriched.averageMonthlyValue = enriched.totalValue / Object.keys(enriched.monthlyData).length;
        }

        // Add metadata
        enriched.processedAt = new Date();
        enriched.confidence = this.calculateItemConfidence(enriched);

        return enriched;
      });
    };
  }

  createDataNormalizer() {
    return (data, config) => {
      return data.map(item => {
        const normalized = { ...item };

        // Normalize account names
        if (normalized.accountName) {
          normalized.normalizedAccountName = this.normalizeAccountName(normalized.accountName);
        }

        // Normalize values to consistent format
        if (normalized.value !== null) {
          normalized.normalizedValue = this.normalizeNumericValue(normalized.value);
        }

        // Normalize monthly data
        if (normalized.monthlyData) {
          normalized.normalizedMonthlyData = {};
          Object.entries(normalized.monthlyData).forEach(([month, value]) => {
            normalized.normalizedMonthlyData[month] = this.normalizeNumericValue(value);
          });
        }

        // Normalize account type
        if (normalized.type) {
          normalized.normalizedType = this.normalizeAccountType(normalized.type);
        }

        return normalized;
      });
    };
  }

  generateAccounts(processedData, schema) {
    const accountsMap = new Map();

    processedData.forEach(item => {
      if (!item.accountName || item.validationErrors?.length > 0) return;

      const accountKey = item.normalizedAccountName || item.accountName;
      
      if (!accountsMap.has(accountKey)) {
        accountsMap.set(accountKey, {
          id: this.generateAccountId(accountKey),
          name: item.accountName,
          normalizedName: item.normalizedAccountName,
          type: item.normalizedType || item.type,
          category: item.standardizedCategory || item.category,
          autoDetected: item.autoDetectedType || false,
          confidence: item.confidence || 0,
          sourceRows: [],
          metadata: {
            createdFrom: 'excel_import',
            importDate: new Date(),
            originalData: []
          }
        });
      }

      const account = accountsMap.get(accountKey);
      account.sourceRows.push(item.rowIndex);
      account.metadata.originalData.push({
        row: item.rowIndex,
        rawData: item.rawRow
      });
    });

    return Array.from(accountsMap.values());
  }

  generateTransactions(processedData, schema) {
    const transactions = [];

    processedData.forEach(item => {
      if (!item.accountName || item.validationErrors?.length > 0) return;

      const accountId = this.generateAccountId(item.normalizedAccountName || item.accountName);

      if (item.value !== null && item.normalizedValue !== null) {
        // Single transaction
        transactions.push({
          id: this.generateTransactionId(item),
          accountId: accountId,
          amount: item.normalizedValue,
          date: item.date ? new Date(item.date) : new Date(),
          description: `Import from Excel - Row ${item.rowIndex}`,
          category: item.standardizedCategory || item.category || 'General',
          type: item.normalizedValue >= 0 ? 'income' : 'expense',
          metadata: {
            sourceRow: item.rowIndex,
            importMethod: 'excel_single_value',
            originalValue: item.value,
            confidence: item.confidence
          }
        });
      }

      if (item.monthlyData && item.normalizedMonthlyData) {
        // Monthly transactions
        Object.entries(item.normalizedMonthlyData).forEach(([monthIndex, value]) => {
          if (value !== null && !isNaN(value)) {
            const month = parseInt(monthIndex);
            const date = new Date();
            date.setMonth(month);
            date.setDate(1); // First day of month

            transactions.push({
              id: this.generateTransactionId(item, month),
              accountId: accountId,
              amount: value,
              date: date,
              description: `Import from Excel - ${this.getMonthName(month)} ${date.getFullYear()}`,
              category: item.standardizedCategory || item.category || 'General',
              type: value >= 0 ? 'income' : 'expense',
              metadata: {
                sourceRow: item.rowIndex,
                month: month,
                importMethod: 'excel_monthly_value',
                originalValue: item.monthlyData[monthIndex],
                confidence: item.confidence
              }
            });
          }
        });
      }
    });

    return transactions;
  }

  generateMetadata(rawData, processedData, schema) {
    return {
      importDate: new Date(),
      sourceFile: rawData.metadata?.fileName || 'Unknown',
      totalRows: rawData.data?.length || 0,
      processedRows: processedData.length,
      validRows: processedData.filter(item => !item.validationErrors?.length).length,
      invalidRows: processedData.filter(item => item.validationErrors?.length > 0).length,
      accountsCreated: new Set(processedData.map(item => item.normalizedAccountName || item.accountName)).size,
      transactionsCreated: this.countTransactions(processedData),
      averageConfidence: this.calculateAverageConfidence(processedData),
      schema: schema,
      transformationPipeline: {
        steps: ['extract', 'clean', 'validate', 'enrich', 'normalize'],
        version: '1.0.0'
      }
    };
  }

  generateStatistics(processedData) {
    const stats = {
      dataQuality: {},
      valueDistribution: {},
      accountTypes: {},
      confidenceDistribution: {}
    };

    // Data quality statistics
    const totalItems = processedData.length;
    const validItems = processedData.filter(item => !item.validationErrors?.length).length;
    
    stats.dataQuality = {
      totalItems,
      validItems,
      invalidItems: totalItems - validItems,
      qualityScore: totalItems > 0 ? (validItems / totalItems) * 100 : 0
    };

    // Value distribution
    const values = processedData
      .map(item => item.normalizedValue)
      .filter(val => val !== null && !isNaN(val));
    
    if (values.length > 0) {
      stats.valueDistribution = {
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: this.calculateMedian(values),
        count: values.length
      };
    }

    // Account type distribution
    processedData.forEach(item => {
      if (item.normalizedType) {
        stats.accountTypes[item.normalizedType] = (stats.accountTypes[item.normalizedType] || 0) + 1;
      }
    });

    // Confidence distribution
    const confidences = processedData
      .map(item => item.confidence)
      .filter(conf => conf !== undefined);
    
    if (confidences.length > 0) {
      stats.confidenceDistribution = {
        average: confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length,
        high: confidences.filter(conf => conf > 0.8).length,
        medium: confidences.filter(conf => conf > 0.5 && conf <= 0.8).length,
        low: confidences.filter(conf => conf <= 0.5).length
      };
    }

    return stats;
  }

  // Helper methods for data transformation
  parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$€£¥₹,\s]/g, '');
    
    // Handle negative values in parentheses
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1));
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  validateCurrency(value) {
    const parsed = this.parseCurrency(value);
    return parsed !== null && isFinite(parsed);
  }

  formatCurrency(value) {
    if (typeof value !== 'number') return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  parseDate(value) {
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;
    
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  validateDate(value) {
    const parsed = this.parseDate(value);
    return parsed !== null;
  }

  formatDate(value) {
    const date = this.parseDate(value);
    return date ? date.toISOString().split('T')[0] : null;
  }

  parseAccountName(value) {
    if (typeof value !== 'string') return null;
    return value.trim();
  }

  validateAccountName(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  formatAccountName(value) {
    if (!this.validateAccountName(value)) return null;
    return value.trim();
  }

  parsePercentage(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    
    const cleaned = value.replace(/[%\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed / 100;
  }

  validatePercentage(value) {
    const parsed = this.parsePercentage(value);
    return parsed !== null && parsed >= -1 && parsed <= 1;
  }

  formatPercentage(value) {
    if (typeof value !== 'number') return null;
    return (value * 100).toFixed(2) + '%';
  }

  parseAccountType(value) {
    if (typeof value !== 'string') return null;
    return value.toLowerCase().trim();
  }

  validateAccountType(value) {
    const validTypes = ['asset', 'liability', 'income', 'expense'];
    const parsed = this.parseAccountType(value);
    return parsed && validTypes.includes(parsed);
  }

  formatAccountType(value) {
    const parsed = this.parseAccountType(value);
    return parsed ? parsed.charAt(0).toUpperCase() + parsed.slice(1) : null;
  }

  cleanText(value) {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/\s+/g, ' ');
  }

  cleanNumericValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      return this.parseCurrency(value);
    }
    return null;
  }

  cleanDate(value) {
    return this.parseDate(value);
  }

  detectAccountType(accountName) {
    const nameLower = accountName.toLowerCase();
    
    const assetKeywords = ['cash', 'checking', 'savings', 'investment', '401k', 'ira', 'stock', 'bond', 'asset'];
    const liabilityKeywords = ['loan', 'debt', 'credit', 'mortgage', 'liability', 'owe'];
    
    const hasAsset = assetKeywords.some(keyword => nameLower.includes(keyword));
    const hasLiability = liabilityKeywords.some(keyword => nameLower.includes(keyword));
    
    if (hasLiability) return 'liability';
    if (hasAsset) return 'asset';
    return 'asset'; // Default
  }

  standardizeCategory(category) {
    if (typeof category !== 'string') return category;
    
    const categoryLower = category.toLowerCase().trim();
    const standardCategories = {
      'retirement': ['401k', 'ira', 'roth', 'pension', 'retirement'],
      'real_estate': ['house', 'home', 'property', 'real estate', 'mortgage'],
      'investment': ['stock', 'bond', 'mutual fund', 'etf', 'investment'],
      'cash': ['cash', 'checking', 'savings', 'money market'],
      'debt': ['loan', 'debt', 'credit card', 'liability'],
      'vehicle': ['car', 'auto', 'vehicle', 'truck']
    };
    
    for (const [standard, keywords] of Object.entries(standardCategories)) {
      if (keywords.some(keyword => categoryLower.includes(keyword))) {
        return standard;
      }
    }
    
    return category;
  }

  normalizeAccountName(accountName) {
    if (typeof accountName !== 'string') return accountName;
    
    return accountName
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim();
  }

  normalizeNumericValue(value) {
    const parsed = this.parseCurrency(value);
    return parsed !== null ? Math.round(parsed * 100) / 100 : null;
  }

  normalizeAccountType(type) {
    if (typeof type !== 'string') return type;
    
    const typeLower = type.toLowerCase().trim();
    const typeMap = {
      'assets': 'asset',
      'liabilities': 'liability',
      'incomes': 'income',
      'expenses': 'expense'
    };
    
    return typeMap[typeLower] || typeLower;
  }

  calculateItemConfidence(item) {
    let confidence = 0;
    let factors = 0;
    
    // Account name confidence
    if (item.accountName && this.validateAccountName(item.accountName)) {
      confidence += 0.3;
      factors += 0.3;
    }
    
    // Value confidence
    if (item.value !== null && this.validateCurrency(item.value)) {
      confidence += 0.3;
      factors += 0.3;
    }
    
    // Monthly data confidence
    if (item.monthlyData) {
      const validMonths = Object.values(item.monthlyData).filter(val => this.validateCurrency(val)).length;
      const totalMonths = Object.keys(item.monthlyData).length;
      if (totalMonths > 0) {
        confidence += (validMonths / totalMonths) * 0.3;
        factors += 0.3;
      }
    }
    
    // Type confidence
    if (item.type && !item.autoDetectedType) {
      confidence += 0.1;
      factors += 0.1;
    } else if (item.autoDetectedType) {
      confidence += 0.05;
      factors += 0.1;
    }
    
    return factors > 0 ? confidence / factors : 0;
  }

  calculateAverageConfidence(processedData) {
    const confidences = processedData
      .map(item => item.confidence)
      .filter(conf => conf !== undefined);
    
    return confidences.length > 0 
      ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length 
      : 0;
  }

  countTransactions(processedData) {
    let count = 0;
    
    processedData.forEach(item => {
      if (item.value !== null) count++;
      if (item.monthlyData) {
        count += Object.values(item.monthlyData).filter(val => val !== null).length;
      }
    });
    
    return count;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  getMonthName(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex] || 'Unknown';
  }

  generateAccountId(accountName) {
    return `account_${accountName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
  }

  generateTransactionId(item, monthIndex = null) {
    const base = `txn_${item.rowIndex}`;
    return monthIndex !== null ? `${base}_month_${monthIndex}` : `${base}_${Date.now()}`;
  }

  validateResults(results) {
    // Validate accounts
    results.accounts.forEach((account, index) => {
      if (!account.name || !account.type) {
        results.errors.push({
          type: 'validation',
          message: `Account ${index} missing required fields`,
          account: account
        });
      }
    });

    // Validate transactions
    results.transactions.forEach((transaction, index) => {
      if (!transaction.accountId || transaction.amount === null) {
        results.errors.push({
          type: 'validation',
          message: `Transaction ${index} missing required fields`,
          transaction: transaction
        });
      }
    });

    // Check for data consistency
    const accountIds = new Set(results.accounts.map(a => a.id));
    const transactionAccountIds = new Set(results.transactions.map(t => t.accountId));
    
    transactionAccountIds.forEach(accountId => {
      if (!accountIds.has(accountId)) {
        results.errors.push({
          type: 'consistency',
          message: `Transaction references non-existent account: ${accountId}`
        });
      }
    });
  }
}

export default DataTransformationPipeline;