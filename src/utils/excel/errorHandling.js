export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.recoveryStrategies = new Map();
    this.initializeRecoveryStrategies();
  }

  initializeRecoveryStrategies() {
    // File parsing errors
    this.recoveryStrategies.set('FILE_PARSE_ERROR', {
      strategy: 'retry_with_different_encoding',
      fallback: 'manual_column_detection',
      message: 'Try converting file to UTF-8 or check for special characters'
    });

    // Missing data errors
    this.recoveryStrategies.set('MISSING_ACCOUNT_COLUMN', {
      strategy: 'suggest_alternatives',
      fallback: 'manual_mapping',
      message: 'Try mapping a different column or check column headers'
    });

    // Invalid data format errors
    this.recoveryStrategies.set('INVALID_CURRENCY_FORMAT', {
      strategy: 'auto_format_correction',
      fallback: 'skip_invalid_rows',
      message: 'Attempting to clean currency format automatically'
    });

    // Structure detection errors
    this.recoveryStrategies.set('UNKNOWN_STRUCTURE', {
      strategy: 'manual_structure_selection',
      fallback: 'default_single_value',
      message: 'Could not auto-detect structure. Please select manually.'
    });

    // Validation errors
    this.recoveryStrategies.set('VALIDATION_FAILED', {
      strategy: 'partial_import',
      fallback: 'exclude_invalid_data',
      message: 'Some data failed validation. Import valid rows only?'
    });
  }

  handleError(error, context = {}) {
    const errorInfo = this.categorizeError(error, context);
    this.logError(errorInfo);
    
    const recovery = this.getRecoveryStrategy(errorInfo.type);
    if (recovery) {
      return this.executeRecoveryStrategy(recovery, errorInfo, context);
    }

    return {
      success: false,
      error: errorInfo,
      recovery: null
    };
  }

  categorizeError(error, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: 'UNKNOWN_ERROR',
      severity: 'error',
      message: error.message || 'Unknown error occurred',
      originalError: error,
      context: context,
      stackTrace: error.stack,
      recoverable: false
    };

    // Categorize based on error message and context
    if (error.message.includes('Cannot read property') || error.message.includes('undefined')) {
      errorInfo.type = 'NULL_REFERENCE_ERROR';
      errorInfo.severity = 'error';
      errorInfo.recoverable = true;
    } else if (error.message.includes('parse') || error.message.includes('invalid')) {
      errorInfo.type = 'FILE_PARSE_ERROR';
      errorInfo.severity = 'error';
      errorInfo.recoverable = true;
    } else if (error.message.includes('column') || error.message.includes('mapping')) {
      errorInfo.type = 'MAPPING_ERROR';
      errorInfo.severity = 'warning';
      errorInfo.recoverable = true;
    } else if (error.message.includes('validation')) {
      errorInfo.type = 'VALIDATION_ERROR';
      errorInfo.severity = 'warning';
      errorInfo.recoverable = true;
    } else if (error.message.includes('format') || error.message.includes('currency')) {
      errorInfo.type = 'FORMAT_ERROR';
      errorInfo.severity = 'warning';
      errorInfo.recoverable = true;
    } else if (error.message.includes('structure') || error.message.includes('detect')) {
      errorInfo.type = 'STRUCTURE_DETECTION_ERROR';
      errorInfo.severity = 'warning';
      errorInfo.recoverable = true;
    }

    return errorInfo;
  }

  getRecoveryStrategy(errorType) {
    return this.recoveryStrategies.get(errorType) || this.recoveryStrategies.get('UNKNOWN_ERROR');
  }

  executeRecoveryStrategy(recovery, errorInfo, context) {
    try {
      switch (recovery.strategy) {
        case 'retry_with_different_encoding':
          return this.retryWithDifferentEncoding(context);
        
        case 'suggest_alternatives':
          return this.suggestAlternatives(context);
        
        case 'auto_format_correction':
          return this.autoFormatCorrection(context);
        
        case 'manual_structure_selection':
          return this.promptManualStructureSelection(context);
        
        case 'partial_import':
          return this.enablePartialImport(context);
        
        case 'skip_invalid_rows':
          return this.skipInvalidRows(context);
        
        default:
          return this.defaultRecovery(recovery, errorInfo, context);
      }
    } catch (recoveryError) {
      return {
        success: false,
        error: errorInfo,
        recoveryError: this.categorizeError(recoveryError, context),
        recovery: recovery.fallback
      };
    }
  }

  retryWithDifferentEncoding(context) {
    return {
      success: true,
      action: 'retry',
      suggestions: [
        'Try saving the Excel file as a new .xlsx file',
        'Check for special characters in the file',
        'Ensure the file is not corrupted'
      ],
      userPrompt: 'File parsing failed. Would you like to try a different approach?'
    };
  }

  suggestAlternatives(context) {
    const suggestions = [];
    
    if (context.availableColumns) {
      const accountLikeColumns = context.availableColumns.filter(col => 
        this.isLikelyAccountColumn(col.header)
      );
      
      if (accountLikeColumns.length > 0) {
        suggestions.push({
          type: 'alternative_columns',
          columns: accountLikeColumns,
          message: 'These columns might contain account names'
        });
      }
    }

    return {
      success: true,
      action: 'suggest',
      suggestions: suggestions,
      userPrompt: 'Could not find account column. Please select from suggested alternatives.'
    };
  }

  autoFormatCorrection(context) {
    const corrections = [];
    
    if (context.invalidValues) {
      context.invalidValues.forEach(value => {
        const corrected = this.attemptCurrencyCorrection(value);
        if (corrected.success) {
          corrections.push({
            original: value,
            corrected: corrected.value,
            confidence: corrected.confidence
          });
        }
      });
    }

    return {
      success: corrections.length > 0,
      action: 'auto_correct',
      corrections: corrections,
      userPrompt: corrections.length > 0 
        ? `Automatically corrected ${corrections.length} currency values. Continue?`
        : 'Could not auto-correct currency format. Manual review required.'
    };
  }

  promptManualStructureSelection(context) {
    const structureOptions = [
      {
        type: 'single',
        name: 'Single Value per Row',
        description: 'Each row contains one account with one value',
        example: 'Account Name | Amount | Type'
      },
      {
        type: 'monthly',
        name: 'Monthly Columns',
        description: 'Each row contains monthly values for one account',
        example: 'Account Name | Jan | Feb | Mar | ...'
      },
      {
        type: 'matrix',
        name: 'Matrix Format',
        description: 'Accounts as rows, time periods as columns',
        example: 'Rows = Accounts, Columns = Time Periods'
      }
    ];

    return {
      success: true,
      action: 'manual_selection',
      options: structureOptions,
      userPrompt: 'Could not auto-detect file structure. Please select the format that matches your data.'
    };
  }

  enablePartialImport(context) {
    const validData = context.validationResults?.valid || [];
    const invalidData = context.validationResults?.invalid || [];

    return {
      success: validData.length > 0,
      action: 'partial_import',
      validCount: validData.length,
      invalidCount: invalidData.length,
      userPrompt: `${validData.length} rows are valid, ${invalidData.length} have errors. Import valid rows only?`
    };
  }

  skipInvalidRows(context) {
    if (context.data) {
      const filtered = context.data.filter(row => this.isValidRow(row));
      
      return {
        success: true,
        action: 'filter',
        originalCount: context.data.length,
        filteredCount: filtered.length,
        filteredData: filtered,
        userPrompt: `Filtered out ${context.data.length - filtered.length} invalid rows. Continue with ${filtered.length} valid rows?`
      };
    }

    return {
      success: false,
      action: 'filter',
      userPrompt: 'No valid rows found to import.'
    };
  }

  defaultRecovery(recovery, errorInfo, context) {
    return {
      success: false,
      action: 'manual',
      error: errorInfo,
      userPrompt: recovery.message || 'Manual intervention required.',
      suggestions: [
        'Check your file format and structure',
        'Verify column headers are correct',
        'Ensure data is in the expected format'
      ]
    };
  }

  attemptCurrencyCorrection(value) {
    if (typeof value === 'number') {
      return { success: true, value: value, confidence: 1.0 };
    }

    if (typeof value !== 'string') {
      return { success: false, value: null, confidence: 0 };
    }

    let cleaned = value.trim();
    let confidence = 0.5;

    // Remove common currency symbols
    cleaned = cleaned.replace(/[$€£¥₹]/g, '');
    if (cleaned !== value) confidence += 0.2;

    // Remove commas
    cleaned = cleaned.replace(/,/g, '');
    if (cleaned !== value) confidence += 0.1;

    // Handle parentheses (negative values)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      cleaned = '-' + cleaned.slice(1, -1);
      confidence += 0.2;
    }

    // Try to parse as float
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return { success: true, value: parsed, confidence: confidence };
    }

    return { success: false, value: null, confidence: 0 };
  }

  isLikelyAccountColumn(header) {
    if (typeof header !== 'string') return false;
    
    const accountKeywords = ['account', 'name', 'description', 'item', 'category'];
    const headerLower = header.toLowerCase();
    
    return accountKeywords.some(keyword => headerLower.includes(keyword));
  }

  isValidRow(row) {
    // Basic validation - row should have at least one non-null value
    return Array.isArray(row) && row.some(cell => cell != null && cell !== '');
  }

  logError(errorInfo) {
    this.errors.push(errorInfo);
    
    // Log to console for debugging
    if (errorInfo.severity === 'error') {
      console.error('[Excel Import Error]', errorInfo);
    } else {
      console.warn('[Excel Import Warning]', errorInfo);
    }
  }

  logWarning(message, context = {}) {
    const warning = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: 'WARNING',
      message: message,
      context: context
    };
    
    this.warnings.push(warning);
    console.warn('[Excel Import Warning]', warning);
  }

  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getErrors(severity = null) {
    if (severity) {
      return this.errors.filter(error => error.severity === severity);
    }
    return [...this.errors];
  }

  getWarnings() {
    return [...this.warnings];
  }

  clearErrors() {
    this.errors = [];
    this.warnings = [];
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getErrorSummary() {
    const summary = {
      total: this.errors.length,
      critical: 0,
      errors: 0,
      warnings: 0,
      recoverable: 0,
      byType: {}
    };

    this.errors.forEach(error => {
      switch (error.severity) {
        case 'critical':
          summary.critical++;
          break;
        case 'error':
          summary.errors++;
          break;
        case 'warning':
          summary.warnings++;
          break;
        default:
          // Handle unknown severity
          break;
      }

      if (error.recoverable) {
        summary.recoverable++;
      }

      summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
    });

    return summary;
  }

  exportErrorLog() {
    return {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      warnings: this.warnings,
      summary: this.getErrorSummary()
    };
  }

  // Validation helpers
  validateFileStructure(file) {
    const errors = [];
    
    if (!file) {
      errors.push({
        type: 'FILE_MISSING',
        message: 'No file provided for import'
      });
      return { valid: false, errors };
    }

    if (!file.name.match(/\.(xlsx?|csv)$/i)) {
      errors.push({
        type: 'INVALID_FILE_TYPE',
        message: 'File must be Excel (.xlsx, .xls) or CSV format'
      });
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push({
        type: 'FILE_TOO_LARGE',
        message: 'File size exceeds 50MB limit'
      });
    }

    if (file.size === 0) {
      errors.push({
        type: 'EMPTY_FILE',
        message: 'File appears to be empty'
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  validateMapping(mapping, availableColumns) {
    const errors = [];
    const warnings = [];

    if (!mapping.accountColumn && mapping.accountColumn !== 0) {
      errors.push({
        type: 'MISSING_ACCOUNT_COLUMN',
        message: 'Account name column is required'
      });
    }

    if (mapping.structure === 'single' && !mapping.valueColumn && mapping.valueColumn !== 0) {
      errors.push({
        type: 'MISSING_VALUE_COLUMN',
        message: 'Value column is required for single-value structure'
      });
    }

    if (mapping.structure === 'monthly' && (!mapping.monthColumns || Object.keys(mapping.monthColumns).length === 0)) {
      errors.push({
        type: 'MISSING_MONTH_COLUMNS',
        message: 'At least one month column is required for monthly structure'
      });
    }

    // Check for duplicate column assignments
    const usedColumns = [];
    if (mapping.accountColumn !== null) usedColumns.push(mapping.accountColumn);
    if (mapping.valueColumn !== null) usedColumns.push(mapping.valueColumn);
    if (mapping.categoryColumn !== null) usedColumns.push(mapping.categoryColumn);
    if (mapping.dateColumn !== null) usedColumns.push(mapping.dateColumn);
    
    if (mapping.monthColumns) {
      Object.values(mapping.monthColumns).forEach(col => usedColumns.push(col));
    }

    const duplicates = usedColumns.filter((item, index) => usedColumns.indexOf(item) !== index);
    if (duplicates.length > 0) {
      warnings.push({
        type: 'DUPLICATE_COLUMN_MAPPING',
        message: `Column(s) ${duplicates.join(', ')} are mapped multiple times`
      });
    }

    // Check column bounds
    const maxColumn = availableColumns ? availableColumns.length - 1 : 100;
    usedColumns.forEach(col => {
      if (col < 0 || col > maxColumn) {
        errors.push({
          type: 'COLUMN_OUT_OF_BOUNDS',
          message: `Column ${col} is outside valid range (0-${maxColumn})`
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  validateData(data, mapping) {
    const errors = [];
    const warnings = [];
    let validRows = 0;
    let invalidRows = 0;

    if (!data || !Array.isArray(data) || data.length === 0) {
      errors.push({
        type: 'NO_DATA',
        message: 'No data found to validate'
      });
      return { valid: false, errors: errors, warnings: warnings, validRows: 0, invalidRows: 0 };
    }

    data.forEach((row, index) => {
      const rowErrors = [];
      
      // Check account name
      if (mapping.accountColumn !== null) {
        const accountName = row[mapping.accountColumn];
        if (!accountName || (typeof accountName === 'string' && accountName.trim() === '')) {
          rowErrors.push(`Row ${index + 1}: Missing account name`);
        }
      }

      // Check values
      if (mapping.structure === 'single' && mapping.valueColumn !== null) {
        const value = row[mapping.valueColumn];
        if (value === null || value === undefined || value === '') {
          rowErrors.push(`Row ${index + 1}: Missing value`);
        } else if (typeof value === 'string' && isNaN(parseFloat(value.replace(/[^0-9.-]/g, '')))) {
          rowErrors.push(`Row ${index + 1}: Invalid numeric value`);
        }
      }

      // Check monthly data
      if (mapping.structure === 'monthly' && mapping.monthColumns) {
        let hasValidMonth = false;
        Object.entries(mapping.monthColumns).forEach(([month, colIndex]) => {
          const value = row[colIndex];
          if (value !== null && value !== undefined && value !== '') {
            const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
            if (!isNaN(numericValue)) {
              hasValidMonth = true;
            }
          }
        });
        
        if (!hasValidMonth) {
          rowErrors.push(`Row ${index + 1}: No valid monthly data found`);
        }
      }

      if (rowErrors.length > 0) {
        invalidRows++;
        warnings.push({
          type: 'ROW_VALIDATION_ERROR',
          message: rowErrors.join(', '),
          row: index + 1
        });
      } else {
        validRows++;
      }
    });

    if (validRows === 0) {
      errors.push({
        type: 'NO_VALID_DATA',
        message: 'No valid rows found in the data'
      });
    } else if (invalidRows > validRows) {
      warnings.push({
        type: 'MOSTLY_INVALID_DATA',
        message: `More invalid rows (${invalidRows}) than valid rows (${validRows})`
      });
    }

    return {
      valid: errors.length === 0 && validRows > 0,
      errors: errors,
      warnings: warnings,
      validRows: validRows,
      invalidRows: invalidRows
    };
  }
}

export default ErrorHandler;