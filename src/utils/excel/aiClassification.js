export class AIClassificationEngine {
  constructor() {
    this.accountTypeClassifiers = {
      asset: this.createAssetClassifier(),
      liability: this.createLiabilityClassifier(),
      income: this.createIncomeClassifier(),
      expense: this.createExpenseClassifier()
    };

    this.dataTypeClassifiers = {
      temporal: this.createTemporalClassifier(),
      monetary: this.createMonetaryClassifier(),
      identifier: this.createIdentifierClassifier(),
      category: this.createCategoryClassifier()
    };

    this.structureClassifiers = {
      balance_sheet: this.createBalanceSheetClassifier(),
      income_statement: this.createIncomeStatementClassifier(),
      cash_flow: this.createCashFlowClassifier(),
      net_worth: this.createNetWorthClassifier(),
      budget: this.createBudgetClassifier()
    };
  }

  classifySheet(sheetData, analysis) {
    const classification = {
      sheetType: null,
      confidence: 0,
      accountMappings: [],
      temporalMappings: [],
      valueMappings: [],
      categoryMappings: [],
      suggestedMappings: [],
      warnings: [],
      errors: []
    };

    // Classify sheet type
    classification.sheetType = this.classifySheetType(sheetData, analysis);
    
    // Generate account mappings
    classification.accountMappings = this.generateAccountMappings(sheetData, analysis);
    
    // Generate temporal mappings
    classification.temporalMappings = this.generateTemporalMappings(sheetData, analysis);
    
    // Generate value mappings
    classification.valueMappings = this.generateValueMappings(sheetData, analysis);
    
    // Generate category mappings
    classification.categoryMappings = this.generateCategoryMappings(sheetData, analysis);
    
    // Create suggested mappings
    classification.suggestedMappings = this.createSuggestedMappings(classification);
    
    // Calculate overall confidence
    classification.confidence = this.calculateClassificationConfidence(classification);
    
    // Generate warnings and errors
    this.validateClassification(classification);

    return classification;
  }

  classifySheetType(sheetData, analysis) {
    const scores = {};
    
    Object.keys(this.structureClassifiers).forEach(type => {
      scores[type] = this.structureClassifiers[type](sheetData, analysis);
    });

    const bestMatch = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    return {
      type: bestMatch,
      confidence: scores[bestMatch],
      allScores: scores
    };
  }

  generateAccountMappings(sheetData, analysis) {
    const mappings = [];
    
    // Look for account name columns
    if (analysis.structures.length > 0) {
      const tableStructure = analysis.structures.find(s => s.type === 'table');
      
      if (tableStructure) {
        tableStructure.columns.forEach(column => {
          if (column.type === 'text' && column.nonNullCount > 0) {
            const accountTypeScore = this.scoreAccountColumn(sheetData, column.index);
            
            if (accountTypeScore.confidence > 0.5) {
              mappings.push({
                columnIndex: column.index,
                header: column.header,
                type: 'account_name',
                accountType: accountTypeScore.type,
                confidence: accountTypeScore.confidence,
                examples: this.getColumnExamples(sheetData, column.index)
              });
            }
          }
        });
      }
    }

    return mappings;
  }

  generateTemporalMappings(sheetData, analysis) {
    const mappings = [];
    
    // Check for temporal columns
    if (analysis.structures.length > 0) {
      const timeSeriesStructure = analysis.structures.find(s => s.type === 'timeSeries');
      
      if (timeSeriesStructure) {
        if (timeSeriesStructure.orientation === 'columnar') {
          timeSeriesStructure.temporalColumns.forEach(col => {
            const temporalType = this.classifyTemporalValue(col.value);
            mappings.push({
              columnIndex: col.index,
              type: 'temporal',
              temporalType: temporalType.type,
              period: temporalType.period,
              confidence: temporalType.confidence,
              value: col.value
            });
          });
        } else {
          timeSeriesStructure.temporalRows.forEach(row => {
            const temporalType = this.classifyTemporalValue(row.value);
            mappings.push({
              rowIndex: row.index,
              type: 'temporal',
              temporalType: temporalType.type,
              period: temporalType.period,
              confidence: temporalType.confidence,
              value: row.value
            });
          });
        }
      }
    }

    return mappings;
  }

  generateValueMappings(sheetData, analysis) {
    const mappings = [];
    
    // Look for numeric/currency columns
    if (analysis.structures.length > 0) {
      const tableStructure = analysis.structures.find(s => s.type === 'table');
      
      if (tableStructure) {
        tableStructure.columns.forEach(column => {
          if (['number', 'currency'].includes(column.type) && column.nonNullCount > 0) {
            const valueType = this.classifyValueColumn(sheetData, column.index, analysis);
            
            mappings.push({
              columnIndex: column.index,
              header: column.header,
              type: 'value',
              valueType: valueType.type,
              confidence: valueType.confidence,
              dataType: column.type,
              statistics: this.calculateColumnStatistics(sheetData, column.index)
            });
          }
        });
      }
    }

    return mappings;
  }

  generateCategoryMappings(sheetData, analysis) {
    const mappings = [];
    
    // Look for category/type columns
    if (analysis.structures.length > 0) {
      const tableStructure = analysis.structures.find(s => s.type === 'table');
      
      if (tableStructure) {
        tableStructure.columns.forEach(column => {
          if (column.type === 'text' && column.nonNullCount > 0) {
            const categoryScore = this.scoreCategoryColumn(sheetData, column.index);
            
            if (categoryScore.confidence > 0.4) {
              mappings.push({
                columnIndex: column.index,
                header: column.header,
                type: 'category',
                categoryType: categoryScore.type,
                confidence: categoryScore.confidence,
                uniqueValues: categoryScore.uniqueValues
              });
            }
          }
        });
      }
    }

    return mappings;
  }

  createSuggestedMappings(classification) {
    const suggestions = [];
    
    // Suggest standard financial sheet mappings
    const accountMapping = classification.accountMappings.find(m => 
      m.type === 'account_name' && m.confidence > 0.7
    );
    
    const valueMapping = classification.valueMappings.find(m => 
      m.confidence > 0.7
    );
    
    if (accountMapping && valueMapping) {
      if (classification.temporalMappings.length > 0) {
        // Time series format
        suggestions.push({
          type: 'time_series',
          accountColumn: accountMapping.columnIndex,
          temporalColumns: classification.temporalMappings.map(t => t.columnIndex),
          confidence: Math.min(accountMapping.confidence, 0.9)
        });
      } else {
        // Single value format
        suggestions.push({
          type: 'single_value',
          accountColumn: accountMapping.columnIndex,
          valueColumn: valueMapping.columnIndex,
          categoryColumn: classification.categoryMappings.find(c => 
            c.type === 'category'
          )?.columnIndex,
          confidence: Math.min(accountMapping.confidence, valueMapping.confidence)
        });
      }
    }

    // Suggest balance sheet format
    if (classification.sheetType.type === 'balance_sheet') {
      const assetAccounts = classification.accountMappings.filter(m => 
        m.accountType === 'asset'
      );
      const liabilityAccounts = classification.accountMappings.filter(m => 
        m.accountType === 'liability'
      );
      
      if (assetAccounts.length > 0 && liabilityAccounts.length > 0) {
        suggestions.push({
          type: 'balance_sheet',
          assetSection: { start: 0, end: assetAccounts.length },
          liabilitySection: { start: assetAccounts.length, end: -1 },
          confidence: classification.sheetType.confidence
        });
      }
    }

    return suggestions;
  }

  // Account Type Classifiers
  createAssetClassifier() {
    return (text) => {
      const assetKeywords = [
        'cash', 'checking', 'savings', 'investment', 'stock', 'bond',
        '401k', 'ira', 'roth', 'retirement', 'mutual fund', 'etf',
        'real estate', 'property', 'house', 'home', 'vehicle', 'car',
        'asset', 'receivable', 'inventory', 'equipment', 'deposit'
      ];
      
      return this.scoreTextAgainstKeywords(text, assetKeywords);
    };
  }

  createLiabilityClassifier() {
    return (text) => {
      const liabilityKeywords = [
        'debt', 'loan', 'mortgage', 'credit card', 'liability',
        'payable', 'owe', 'obligation', 'lease', 'line of credit',
        'student loan', 'auto loan', 'personal loan', 'heloc'
      ];
      
      return this.scoreTextAgainstKeywords(text, liabilityKeywords);
    };
  }

  createIncomeClassifier() {
    return (text) => {
      const incomeKeywords = [
        'income', 'salary', 'wage', 'earning', 'revenue', 'profit',
        'dividend', 'interest income', 'rental income', 'commission',
        'bonus', 'royalty', 'pension income', 'social security'
      ];
      
      return this.scoreTextAgainstKeywords(text, incomeKeywords);
    };
  }

  createExpenseClassifier() {
    return (text) => {
      const expenseKeywords = [
        'expense', 'cost', 'spending', 'payment', 'bill', 'utilities',
        'rent', 'insurance', 'tax', 'maintenance', 'subscription',
        'groceries', 'fuel', 'transportation', 'entertainment'
      ];
      
      return this.scoreTextAgainstKeywords(text, expenseKeywords);
    };
  }

  // Data Type Classifiers
  createTemporalClassifier() {
    return (text) => {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                     'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const quarters = ['q1', 'q2', 'q3', 'q4'];
      const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
      
      const textLower = text.toLowerCase();
      
      if (months.some(m => textLower.includes(m))) {
        return { type: 'month', confidence: 0.9 };
      }
      if (quarters.some(q => textLower.includes(q))) {
        return { type: 'quarter', confidence: 0.9 };
      }
      if (years.some(y => textLower.includes(y))) {
        return { type: 'year', confidence: 0.8 };
      }
      
      return { type: 'unknown', confidence: 0 };
    };
  }

  createMonetaryClassifier() {
    return (value) => {
      if (typeof value === 'number') {
        return { type: 'number', confidence: 0.8 };
      }
      
      const text = String(value);
      if (/[$€£¥₹]/.test(text)) {
        return { type: 'currency', confidence: 0.9 };
      }
      if (/\([\d,]+\.?\d*\)/.test(text)) {
        return { type: 'negative_currency', confidence: 0.8 };
      }
      
      return { type: 'unknown', confidence: 0 };
    };
  }

  createIdentifierClassifier() {
    return (text) => {
      if (/^\d{4,20}$/.test(text)) {
        return { type: 'account_number', confidence: 0.7 };
      }
      if (/^[A-Z]{2,5}\d{3,}$/.test(text)) {
        return { type: 'account_code', confidence: 0.6 };
      }
      
      return { type: 'unknown', confidence: 0 };
    };
  }

  createCategoryClassifier() {
    return (text) => {
      const categoryKeywords = ['type', 'category', 'class', 'group'];
      
      if (categoryKeywords.some(k => text.toLowerCase().includes(k))) {
        return { type: 'category', confidence: 0.8 };
      }
      
      return { type: 'unknown', confidence: 0 };
    };
  }

  // Structure Classifiers
  createBalanceSheetClassifier() {
    return (sheetData, analysis) => {
      let score = 0;
      
      // Look for asset/liability keywords
      const assetKeywords = analysis.keywords.assets.length;
      const liabilityKeywords = analysis.keywords.liabilities.length;
      
      if (assetKeywords > 0 && liabilityKeywords > 0) score += 0.4;
      if (assetKeywords > 3) score += 0.2;
      if (liabilityKeywords > 3) score += 0.2;
      
      // Look for balance sheet structure
      const hasCalculations = analysis.keywords.calculations.length > 0;
      if (hasCalculations) score += 0.2;
      
      return Math.min(score, 1.0);
    };
  }

  createIncomeStatementClassifier() {
    return (sheetData, analysis) => {
      let score = 0;
      
      const incomeKeywords = analysis.keywords.income.length;
      const expenseKeywords = analysis.keywords.expenses.length;
      
      if (incomeKeywords > 0 && expenseKeywords > 0) score += 0.4;
      if (incomeKeywords > 2) score += 0.2;
      if (expenseKeywords > 5) score += 0.2;
      
      // Look for temporal data
      const temporalKeywords = analysis.keywords.temporal.length;
      if (temporalKeywords > 0) score += 0.2;
      
      return Math.min(score, 1.0);
    };
  }

  createCashFlowClassifier() {
    return (sheetData, analysis) => {
      let score = 0;
      
      // Look for cash flow keywords
      const cashKeywords = analysis.keywords.assets.filter(k => 
        k.keyword.includes('cash') || k.keyword.includes('flow')
      ).length;
      
      if (cashKeywords > 0) score += 0.3;
      
      // Look for temporal structure
      const timeSeries = analysis.structures.find(s => s.type === 'timeSeries');
      if (timeSeries) score += 0.4;
      
      // Look for categories
      const hasCategories = analysis.keywords.expenses.length > 3;
      if (hasCategories) score += 0.3;
      
      return Math.min(score, 1.0);
    };
  }

  createNetWorthClassifier() {
    return (sheetData, analysis) => {
      let score = 0;
      
      // Look for net worth keywords
      const netWorthKeywords = ['net worth', 'total assets', 'total liabilities'];
      const foundNetWorth = sheetData.cells && Array.from(sheetData.cells.values()).some(cell => 
        typeof cell.value === 'string' && 
        netWorthKeywords.some(kw => cell.value.toLowerCase().includes(kw))
      );
      
      if (foundNetWorth) score += 0.4;
      
      // Look for assets and liabilities
      if (analysis.keywords.assets.length > 0 && analysis.keywords.liabilities.length > 0) {
        score += 0.3;
      }
      
      // Look for time series data
      const timeSeries = analysis.structures.find(s => s.type === 'timeSeries');
      if (timeSeries) score += 0.3;
      
      return Math.min(score, 1.0);
    };
  }

  createBudgetClassifier() {
    return (sheetData, analysis) => {
      let score = 0;
      
      // Look for budget keywords
      const budgetKeywords = ['budget', 'planned', 'actual', 'variance'];
      const foundBudget = sheetData.cells && Array.from(sheetData.cells.values()).some(cell => 
        typeof cell.value === 'string' && 
        budgetKeywords.some(kw => cell.value.toLowerCase().includes(kw))
      );
      
      if (foundBudget) score += 0.4;
      
      // Look for expense categories
      if (analysis.keywords.expenses.length > 5) score += 0.3;
      
      // Look for multiple numeric columns (budget vs actual)
      const numericColumns = analysis.structures.find(s => s.type === 'table')?.columns
        .filter(c => ['number', 'currency'].includes(c.type)).length || 0;
      
      if (numericColumns >= 2) score += 0.3;
      
      return Math.min(score, 1.0);
    };
  }

  // Helper Methods
  scoreAccountColumn(sheetData, columnIndex) {
    const columnData = this.getColumnData(sheetData, columnIndex);
    const scores = { asset: 0, liability: 0, income: 0, expense: 0 };
    
    columnData.forEach(value => {
      if (typeof value === 'string') {
        const assetScore = this.accountTypeClassifiers.asset(value);
        const liabilityScore = this.accountTypeClassifiers.liability(value);
        const incomeScore = this.accountTypeClassifiers.income(value);
        const expenseScore = this.accountTypeClassifiers.expense(value);
        
        scores.asset += assetScore;
        scores.liability += liabilityScore;
        scores.income += incomeScore;
        scores.expense += expenseScore;
      }
    });

    const bestType = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    return {
      type: bestType,
      confidence: scores[bestType] / columnData.length,
      allScores: scores
    };
  }

  scoreCategoryColumn(sheetData, columnIndex) {
    const columnData = this.getColumnData(sheetData, columnIndex);
    const uniqueValues = [...new Set(columnData.filter(v => v != null))];
    
    // Check if values look like categories
    const categoryIndicators = uniqueValues.filter(value => {
      if (typeof value !== 'string') return false;
      const valueLower = value.toLowerCase();
      return ['type', 'category', 'asset', 'liability', 'income', 'expense'].some(indicator =>
        valueLower.includes(indicator)
      );
    });

    const confidence = categoryIndicators.length / uniqueValues.length;
    
    return {
      type: 'financial_category',
      confidence: confidence,
      uniqueValues: uniqueValues.slice(0, 10) // Sample of unique values
    };
  }

  classifyValueColumn(sheetData, columnIndex, analysis) {
    const columnData = this.getColumnData(sheetData, columnIndex);
    const numericData = columnData.filter(v => typeof v === 'number');
    
    if (numericData.length === 0) {
      return { type: 'unknown', confidence: 0 };
    }

    // Check for patterns that indicate value type
    const hasNegatives = numericData.some(v => v < 0);
    const hasLargeValues = numericData.some(v => Math.abs(v) > 1000);
    // const avg = numericData.reduce((sum, v) => sum + v, 0) / numericData.length;
    
    let type = 'amount';
    let confidence = 0.6;
    
    if (hasLargeValues) {
      type = 'balance';
      confidence = 0.8;
    } else if (hasNegatives) {
      type = 'change';
      confidence = 0.7;
    }

    return { type, confidence };
  }

  classifyTemporalValue(value) {
    const classifier = this.dataTypeClassifiers.temporal(value);
    
    // Determine period
    let period = null;
    const valueLower = String(value).toLowerCase();
    
    if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        .some(m => valueLower.includes(m))) {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      period = months.findIndex(m => valueLower.includes(m));
    }
    
    return {
      ...classifier,
      period
    };
  }

  scoreTextAgainstKeywords(text, keywords) {
    if (typeof text !== 'string') return 0;
    
    const textLower = text.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        // Exact word match gets higher score
        const wordBoundary = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundary.test(text)) {
          score += 1.0;
        } else {
          score += 0.5;
        }
      }
    });
    
    return Math.min(score / keywords.length, 1.0);
  }

  getColumnData(sheetData, columnIndex) {
    if (!sheetData.data) return [];
    return sheetData.data.map(row => row[columnIndex]).filter(v => v !== undefined);
  }

  getColumnExamples(sheetData, columnIndex) {
    const data = this.getColumnData(sheetData, columnIndex);
    return data.filter(v => v != null).slice(0, 5);
  }

  calculateColumnStatistics(sheetData, columnIndex) {
    const data = this.getColumnData(sheetData, columnIndex);
    const numericData = data.filter(v => typeof v === 'number');
    
    if (numericData.length === 0) return null;
    
    const sum = numericData.reduce((sum, v) => sum + v, 0);
    const avg = sum / numericData.length;
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);
    
    return { count: numericData.length, sum, avg, min, max };
  }

  calculateClassificationConfidence(classification) {
    let totalConfidence = 0;
    let factors = 0;

    if (classification.sheetType.confidence > 0) {
      totalConfidence += classification.sheetType.confidence;
      factors++;
    }

    if (classification.accountMappings.length > 0) {
      const avgAccountConfidence = classification.accountMappings.reduce((sum, m) => 
        sum + m.confidence, 0) / classification.accountMappings.length;
      totalConfidence += avgAccountConfidence;
      factors++;
    }

    if (classification.valueMappings.length > 0) {
      const avgValueConfidence = classification.valueMappings.reduce((sum, m) => 
        sum + m.confidence, 0) / classification.valueMappings.length;
      totalConfidence += avgValueConfidence;
      factors++;
    }

    return factors > 0 ? (totalConfidence / factors) * 100 : 0;
  }

  validateClassification(classification) {
    // Check for missing required mappings
    if (classification.accountMappings.length === 0) {
      classification.warnings.push('No account name columns detected');
    }

    if (classification.valueMappings.length === 0) {
      classification.warnings.push('No value columns detected');
    }

    // Check for low confidence mappings
    const lowConfidenceMappings = [
      ...classification.accountMappings,
      ...classification.valueMappings,
      ...classification.temporalMappings
    ].filter(m => m.confidence < 0.5);

    if (lowConfidenceMappings.length > 0) {
      classification.warnings.push(`${lowConfidenceMappings.length} mappings have low confidence`);
    }

    // Check for conflicting mappings
    const accountColumns = classification.accountMappings.map(m => m.columnIndex);
    const valueColumns = classification.valueMappings.map(m => m.columnIndex);
    const overlap = accountColumns.filter(col => valueColumns.includes(col));

    if (overlap.length > 0) {
      classification.errors.push('Same column mapped as both account and value');
    }
  }
}

export default AIClassificationEngine;