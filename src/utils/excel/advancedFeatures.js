export class AdvancedFeatures {
  constructor() {
    this.deduplicationStrategy = 'smart'; // 'strict', 'smart', 'none'
    this.incrementalMode = false;
    this.batchSize = 1000;
  }

  // Multi-file import with deduplication
  async importMultipleFiles(files, options = {}) {
    const results = {
      totalFiles: files.length,
      processedFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
      totalRecords: 0,
      duplicatesFound: 0,
      duplicatesHandled: 0,
      accounts: new Map(),
      transactions: [],
      errors: [],
      warnings: []
    };

    const allAccounts = new Map();
    const allTransactions = [];
    const seenRecords = new Set();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      results.processedFiles++;

      try {
        // Process individual file
        const fileResult = await this.processFileForMultiImport(file, {
          ...options,
          seenRecords,
          allAccounts,
          fileIndex: i
        });

        if (fileResult.success) {
          results.successfulFiles++;
          results.totalRecords += fileResult.records.length;
          
          // Merge accounts
          fileResult.accounts.forEach((account, key) => {
            allAccounts.set(key, account);
          });

          // Add transactions
          allTransactions.push(...fileResult.transactions);
          
          // Track duplicates
          results.duplicatesFound += fileResult.duplicatesFound;
          results.duplicatesHandled += fileResult.duplicatesHandled;
        } else {
          results.failedFiles++;
          results.errors.push({
            file: file.name,
            error: fileResult.error
          });
        }

        if (fileResult.warnings) {
          results.warnings.push(...fileResult.warnings.map(w => ({
            file: file.name,
            ...w
          })));
        }

      } catch (error) {
        results.failedFiles++;
        results.errors.push({
          file: file.name,
          error: error.message
        });
      }
    }

    results.accounts = allAccounts;
    results.transactions = allTransactions;

    return results;
  }

  async processFileForMultiImport(file, options) {
    const { seenRecords, allAccounts } = options;
    
    // Import the main classes
    const { default: ExcelParser } = await import('./excelParser.js');
    const { default: PatternRecognitionEngine } = await import('./patternRecognition.js');
    const { default: AIClassificationEngine } = await import('./aiClassification.js');
    const { default: DataTransformationPipeline } = await import('./dataTransformation.js');

    const parser = new ExcelParser();
    const patternEngine = new PatternRecognitionEngine();
    const aiEngine = new AIClassificationEngine();
    const transformer = new DataTransformationPipeline();

    try {
      // Parse file
      const parsedData = await parser.parseFile(file);
      
      // Analyze patterns
      const analysis = patternEngine.analyzeSheet(parsedData.rawData.sheets[0]);
      
      // Classify data
      const classification = aiEngine.classifySheet(parsedData.rawData.sheets[0], analysis);
      
      // Create auto-mapping based on classification
      const mapping = this.createAutoMapping(classification);
      
      // Transform data
      const transformResult = transformer.transformData(
        parsedData.rawData.sheets[0], 
        mapping, 
        { cleaningRules: {}, validationRules: {} }
      );

      // Handle deduplication
      const deduplicationResult = this.handleDeduplication(
        transformResult, 
        seenRecords, 
        allAccounts, 
        file.name
      );

      return {
        success: true,
        records: deduplicationResult.records,
        accounts: deduplicationResult.accounts,
        transactions: deduplicationResult.transactions,
        duplicatesFound: deduplicationResult.duplicatesFound,
        duplicatesHandled: deduplicationResult.duplicatesHandled,
        warnings: deduplicationResult.warnings
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  createAutoMapping(classification) {
    const mapping = { structure: 'single' };
    
    // Auto-select best account mapping
    if (classification.accountMappings.length > 0) {
      const bestAccount = classification.accountMappings.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      mapping.accountColumn = bestAccount.columnIndex;
    }

    // Auto-select best value mapping
    if (classification.valueMappings.length > 0) {
      const bestValue = classification.valueMappings.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      mapping.valueColumn = bestValue.columnIndex;
    }

    // Check for monthly structure
    if (classification.temporalMappings.length >= 3) {
      mapping.structure = 'monthly';
      mapping.monthColumns = {};
      classification.temporalMappings.forEach(temporal => {
        if (temporal.period !== null) {
          mapping.monthColumns[temporal.period] = temporal.columnIndex;
        }
      });
    }

    return mapping;
  }

  handleDeduplication(transformResult, seenRecords, allAccounts, fileName) {
    const result = {
      records: [],
      accounts: new Map(),
      transactions: [],
      duplicatesFound: 0,
      duplicatesHandled: 0,
      warnings: []
    };

    // Process accounts with deduplication
    transformResult.accounts.forEach(account => {
      const accountKey = this.generateAccountKey(account);
      
      if (allAccounts.has(accountKey)) {
        result.duplicatesFound++;
        
        if (this.deduplicationStrategy === 'smart') {
          // Smart merge - combine data from both accounts
          const existingAccount = allAccounts.get(accountKey);
          const mergedAccount = this.smartMergeAccounts(existingAccount, account);
          allAccounts.set(accountKey, mergedAccount);
          result.duplicatesHandled++;
        } else if (this.deduplicationStrategy === 'strict') {
          // Strict - skip duplicate
          result.warnings.push({
            type: 'duplicate_account_skipped',
            accountName: account.name,
            fileName: fileName
          });
          return;
        }
      } else {
        allAccounts.set(accountKey, account);
      }
      
      result.accounts.set(accountKey, allAccounts.get(accountKey));
    });

    // Process transactions with deduplication
    transformResult.transactions.forEach(transaction => {
      const transactionKey = this.generateTransactionKey(transaction);
      
      if (seenRecords.has(transactionKey)) {
        result.duplicatesFound++;
        
        if (this.deduplicationStrategy === 'smart') {
          // Check if values differ
          const existing = Array.from(seenRecords).find(key => key === transactionKey);
          if (existing && this.shouldUpdateTransaction(transaction, existing)) {
            result.transactions.push(transaction);
            result.duplicatesHandled++;
          }
        } else if (this.deduplicationStrategy === 'strict') {
          result.warnings.push({
            type: 'duplicate_transaction_skipped',
            transaction: transaction,
            fileName: fileName
          });
        }
      } else {
        seenRecords.add(transactionKey);
        result.transactions.push(transaction);
      }
    });

    return result;
  }

  generateAccountKey(account) {
    // Create unique key based on normalized name and type
    return `${account.normalizedName || account.name.toLowerCase()}_${account.type}`;
  }

  generateTransactionKey(transaction) {
    // Create unique key for transaction
    return `${transaction.accountId}_${transaction.date}_${transaction.amount}_${transaction.description}`;
  }

  smartMergeAccounts(existing, newAccount) {
    return {
      ...existing,
      confidence: Math.max(existing.confidence || 0, newAccount.confidence || 0),
      metadata: {
        ...existing.metadata,
        ...newAccount.metadata,
        mergedFrom: [
          ...(existing.metadata?.mergedFrom || []),
          {
            fileName: newAccount.metadata?.fileName,
            importDate: new Date()
          }
        ]
      }
    };
  }

  shouldUpdateTransaction(newTransaction, existingKey) {
    // Logic to determine if we should update an existing transaction
    // For now, we'll be conservative and not update
    return false;
  }

  // Incremental updates
  async performIncrementalUpdate(newData, existingData, options = {}) {
    const result = {
      added: [],
      updated: [],
      unchanged: [],
      conflicts: [],
      summary: {}
    };

    const { updateStrategy = 'conservative' } = options;

    // Create lookup maps for existing data
    const existingAccounts = new Map();
    const existingTransactions = new Map();

    existingData.accounts.forEach(account => {
      existingAccounts.set(this.generateAccountKey(account), account);
    });

    existingData.transactions.forEach(transaction => {
      existingTransactions.set(this.generateTransactionKey(transaction), transaction);
    });

    // Process new accounts
    newData.accounts.forEach(newAccount => {
      const key = this.generateAccountKey(newAccount);
      
      if (existingAccounts.has(key)) {
        const existing = existingAccounts.get(key);
        const comparison = this.compareAccounts(existing, newAccount);
        
        if (comparison.hasChanges) {
          if (updateStrategy === 'aggressive') {
            result.updated.push({
              type: 'account',
              key: key,
              existing: existing,
              new: newAccount,
              changes: comparison.changes
            });
          } else {
            result.conflicts.push({
              type: 'account',
              key: key,
              existing: existing,
              new: newAccount,
              changes: comparison.changes
            });
          }
        } else {
          result.unchanged.push({ type: 'account', key: key });
        }
      } else {
        result.added.push({ type: 'account', data: newAccount });
      }
    });

    // Process new transactions
    newData.transactions.forEach(newTransaction => {
      const key = this.generateTransactionKey(newTransaction);
      
      if (existingTransactions.has(key)) {
        const existing = existingTransactions.get(key);
        const comparison = this.compareTransactions(existing, newTransaction);
        
        if (comparison.hasChanges) {
          if (updateStrategy === 'aggressive') {
            result.updated.push({
              type: 'transaction',
              key: key,
              existing: existing,
              new: newTransaction,
              changes: comparison.changes
            });
          } else {
            result.conflicts.push({
              type: 'transaction',
              key: key,
              existing: existing,
              new: newTransaction,
              changes: comparison.changes
            });
          }
        } else {
          result.unchanged.push({ type: 'transaction', key: key });
        }
      } else {
        result.added.push({ type: 'transaction', data: newTransaction });
      }
    });

    // Generate summary
    result.summary = {
      totalProcessed: newData.accounts.length + newData.transactions.length,
      added: result.added.length,
      updated: result.updated.length,
      unchanged: result.unchanged.length,
      conflicts: result.conflicts.length
    };

    return result;
  }

  compareAccounts(account1, account2) {
    const changes = [];
    let hasChanges = false;

    // Compare key fields
    if (account1.name !== account2.name) {
      changes.push({ field: 'name', old: account1.name, new: account2.name });
      hasChanges = true;
    }

    if (account1.type !== account2.type) {
      changes.push({ field: 'type', old: account1.type, new: account2.type });
      hasChanges = true;
    }

    if (account1.category !== account2.category) {
      changes.push({ field: 'category', old: account1.category, new: account2.category });
      hasChanges = true;
    }

    return { hasChanges, changes };
  }

  compareTransactions(transaction1, transaction2) {
    const changes = [];
    let hasChanges = false;

    // Compare key fields
    if (Math.abs(transaction1.amount - transaction2.amount) > 0.01) {
      changes.push({ field: 'amount', old: transaction1.amount, new: transaction2.amount });
      hasChanges = true;
    }

    if (transaction1.description !== transaction2.description) {
      changes.push({ field: 'description', old: transaction1.description, new: transaction2.description });
      hasChanges = true;
    }

    if (transaction1.category !== transaction2.category) {
      changes.push({ field: 'category', old: transaction1.category, new: transaction2.category });
      hasChanges = true;
    }

    return { hasChanges, changes };
  }

  // Bank export format detection
  detectBankExportFormat(sheetData) {
    const formats = {
      chase: {
        patterns: ['transaction date', 'post date', 'description', 'amount'],
        confidence: 0
      },
      bofa: {
        patterns: ['date', 'description', 'amount', 'running bal'],
        confidence: 0
      },
      wells_fargo: {
        patterns: ['date', 'amount', 'description', 'balance'],
        confidence: 0
      },
      citi: {
        patterns: ['date', 'description', 'debit', 'credit'],
        confidence: 0
      },
      quicken: {
        patterns: ['account', 'category', 'amount', 'date'],
        confidence: 0
      },
      mint: {
        patterns: ['date', 'description', 'original description', 'amount', 'transaction type', 'category', 'account name'],
        confidence: 0
      },
      personal_capital: {
        patterns: ['account', 'date', 'description', 'amount', 'category'],
        confidence: 0
      }
    };

    if (!sheetData.data || sheetData.data.length === 0) {
      return { format: 'unknown', confidence: 0 };
    }

    const headers = sheetData.data[0].map(h => h ? h.toLowerCase().trim() : '');
    
    Object.keys(formats).forEach(formatName => {
      const format = formats[formatName];
      let matches = 0;
      
      format.patterns.forEach(pattern => {
        if (headers.some(header => header.includes(pattern))) {
          matches++;
        }
      });
      
      format.confidence = matches / format.patterns.length;
    });

    const bestFormat = Object.keys(formats).reduce((best, current) => 
      formats[current].confidence > formats[best].confidence ? current : best
    );

    return {
      format: bestFormat,
      confidence: formats[bestFormat].confidence,
      allFormats: formats
    };
  }

  // Common format transformers
  createQuickenTransformer() {
    return {
      accountColumn: 0,
      categoryColumn: 1,
      valueColumn: 2,
      dateColumn: 3,
      transform: (row) => ({
        accountName: row[0],
        category: row[1],
        amount: this.parseAmount(row[2]),
        date: this.parseDate(row[3])
      })
    };
  }

  createMintTransformer() {
    return {
      dateColumn: 0,
      descriptionColumn: 1,
      valueColumn: 3,
      categoryColumn: 5,
      accountColumn: 6,
      transform: (row) => ({
        date: this.parseDate(row[0]),
        description: row[1],
        amount: this.parseAmount(row[3]),
        category: row[5],
        accountName: row[6]
      })
    };
  }

  createPersonalCapitalTransformer() {
    return {
      accountColumn: 0,
      dateColumn: 1,
      descriptionColumn: 2,
      valueColumn: 3,
      categoryColumn: 4,
      transform: (row) => ({
        accountName: row[0],
        date: this.parseDate(row[1]),
        description: row[2],
        amount: this.parseAmount(row[3]),
        category: row[4]
      })
    };
  }

  parseAmount(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    const cleaned = value.replace(/[$,\s]/g, '');
    
    // Handle parentheses (negative values)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1)) || 0;
    }
    
    return parseFloat(cleaned) || 0;
  }

  parseDate(value) {
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return new Date();
    
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  // Batch processing for large files
  async processBatch(data, batchProcessor, batchSize = this.batchSize) {
    const results = [];
    const totalBatches = Math.ceil(data.length / batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);
      
      try {
        const batchResult = await batchProcessor(batch, i, totalBatches);
        results.push(batchResult);
        
        // Allow UI to update
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } catch (error) {
        results.push({
          success: false,
          batch: i,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Export learning data
  exportLearningData() {
    const learningData = {
      templates: [],
      patterns: [],
      corrections: [],
      formatDetectors: [],
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      // Get data from localStorage
      const templates = localStorage.getItem('excel-import-templates');
      if (templates) {
        learningData.templates = JSON.parse(templates);
      }

      const patterns = localStorage.getItem('excel-import-patterns');
      if (patterns) {
        learningData.patterns = JSON.parse(patterns);
      }

      const corrections = localStorage.getItem('excel-import-corrections');
      if (corrections) {
        learningData.corrections = JSON.parse(corrections);
      }

    } catch (error) {
      console.error('Error exporting learning data:', error);
    }

    return learningData;
  }

  // Import learning data
  importLearningData(data) {
    try {
      if (data.templates) {
        localStorage.setItem('excel-import-templates', JSON.stringify(data.templates));
      }

      if (data.patterns) {
        localStorage.setItem('excel-import-patterns', JSON.stringify(data.patterns));
      }

      if (data.corrections) {
        localStorage.setItem('excel-import-corrections', JSON.stringify(data.corrections));
      }

      return { success: true };
    } catch (error) {
      console.error('Error importing learning data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AdvancedFeatures;