export class PatternRecognitionEngine {
  constructor() {
    this.financialKeywords = {
      assets: [
        'asset', 'cash', 'saving', 'checking', 'investment', 'stock', 'bond', 
        '401k', 'ira', 'roth', 'retirement', 'pension', 'fund', 'mutual',
        'etf', 'equity', 'property', 'real estate', 'house', 'home', 'vehicle',
        'car', 'account', 'receivable', 'inventory', 'equipment', 'deposit',
        'cd', 'certificate', 'treasury', 'commodity', 'crypto', 'bitcoin',
        'portfolio', 'brokerage', 'trust', 'estate', 'annuity', 'life insurance'
      ],
      liabilities: [
        'liability', 'loan', 'debt', 'mortgage', 'credit', 'card', 'owe',
        'payable', 'obligation', 'lease', 'rent', 'bill', 'expense',
        'heloc', 'line of credit', 'student loan', 'auto loan', 'personal loan',
        'tax', 'payment', 'balance', 'principal', 'interest', 'apr'
      ],
      income: [
        'income', 'revenue', 'salary', 'wage', 'earning', 'profit', 'gain',
        'dividend', 'interest income', 'rental income', 'commission', 'bonus',
        'royalty', 'pension income', 'social security', 'distribution'
      ],
      expenses: [
        'expense', 'cost', 'spending', 'payment', 'fee', 'charge', 'bill',
        'utilities', 'rent', 'insurance', 'tax', 'maintenance', 'repair',
        'subscription', 'membership', 'groceries', 'fuel', 'transportation'
      ],
      temporal: [
        'january', 'february', 'march', 'april', 'may', 'june', 'july',
        'august', 'september', 'october', 'november', 'december',
        'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        'q1', 'q2', 'q3', 'q4', 'quarter', 'year', 'annual', 'monthly',
        'weekly', 'daily', 'ytd', 'mtd', '2020', '2021', '2022', '2023', '2024', '2025'
      ],
      calculations: [
        'total', 'sum', 'subtotal', 'balance', 'net', 'gross', 'average',
        'mean', 'median', 'percentage', '%', 'ratio', 'change', 'growth',
        'increase', 'decrease', 'variance', 'difference'
      ]
    };

    this.patterns = {
      currency: /[$€£¥₹]\s*[\d,]+\.?\d*/g,
      percentage: /\d+\.?\d*\s*%/g,
      number: /^-?\d{1,3}(,\d{3})*(\.\d+)?$/,
      date: /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/g,
      accountNumber: /\b\d{4,20}\b/g,
      negative: /\([\d,]+\.?\d*\)/g,
      email: /[\w.-]+@[\w.-]+\.\w+/g,
      phone: /[\d\s()+-]{10,}/g
    };
  }

  analyzeSheet(sheetData) {
    const analysis = {
      structures: [],
      patterns: [],
      keywords: [],
      dataTypes: [],
      relationships: [],
      confidence: 0
    };

    // Detect structures
    analysis.structures = this.detectStructures(sheetData);
    
    // Find keywords
    analysis.keywords = this.findKeywords(sheetData);
    
    // Analyze data types
    analysis.dataTypes = this.analyzeDataTypes(sheetData);
    
    // Detect patterns
    analysis.patterns = this.detectPatterns(sheetData);
    
    // Find relationships
    analysis.relationships = this.findRelationships(sheetData);
    
    // Calculate confidence score
    analysis.confidence = this.calculateConfidence(analysis);
    
    return analysis;
  }

  detectStructures(sheetData) {
    const structures = [];
    const data = sheetData.data;
    
    if (!data || data.length === 0) return structures;

    // Detect table structure
    const tableStructure = this.detectTableStructure(data);
    if (tableStructure) structures.push(tableStructure);

    // Detect time series
    const timeSeries = this.detectTimeSeries(data);
    if (timeSeries) structures.push(timeSeries);

    // Detect hierarchical structure
    const hierarchy = this.detectHierarchy(data);
    if (hierarchy) structures.push(hierarchy);

    // Detect matrix structure
    const matrix = this.detectMatrix(data);
    if (matrix) structures.push(matrix);

    return structures;
  }

  detectTableStructure(data) {
    // Check if first row contains headers
    const firstRow = data[0];
    if (!firstRow) return null;

    const headerScore = firstRow.reduce((score, cell) => {
      if (typeof cell === 'string' && isNaN(cell)) {
        return score + 1;
      }
      return score;
    }, 0);

    const isTable = headerScore / firstRow.length > 0.7;

    if (isTable) {
      // Identify data columns
      const columns = [];
      for (let col = 0; col < firstRow.length; col++) {
        const columnData = data.slice(1).map(row => row[col]);
        const columnType = this.detectColumnType(columnData);
        
        columns.push({
          index: col,
          header: firstRow[col],
          type: columnType,
          nonNullCount: columnData.filter(v => v != null).length
        });
      }

      return {
        type: 'table',
        headers: firstRow,
        columns: columns,
        rowCount: data.length - 1,
        confidence: headerScore / firstRow.length
      };
    }

    return null;
  }

  detectTimeSeries(data) {
    // Look for temporal patterns in rows or columns
    const temporalColumns = [];
    const temporalRows = [];

    // Check columns for temporal data
    if (data[0]) {
      data[0].forEach((header, index) => {
        if (this.isTemporalValue(header)) {
          temporalColumns.push({ index, value: header });
        }
      });
    }

    // Check rows for temporal data
    data.forEach((row, index) => {
      if (row[0] && this.isTemporalValue(row[0])) {
        temporalRows.push({ index, value: row[0] });
      }
    });

    if (temporalColumns.length >= 3 || temporalRows.length >= 3) {
      return {
        type: 'timeSeries',
        orientation: temporalColumns.length > temporalRows.length ? 'columnar' : 'row-based',
        temporalColumns,
        temporalRows,
        confidence: Math.max(temporalColumns.length, temporalRows.length) / 12
      };
    }

    return null;
  }

  detectHierarchy(data) {
    // Look for indentation or parent-child relationships
    const hierarchicalRows = [];
    
    data.forEach((row, index) => {
      const firstCell = row[0];
      if (typeof firstCell === 'string') {
        const indent = firstCell.match(/^(\s+)/);
        if (indent) {
          hierarchicalRows.push({
            index,
            level: indent[1].length,
            value: firstCell.trim()
          });
        }
      }
    });

    if (hierarchicalRows.length > 3) {
      return {
        type: 'hierarchy',
        levels: [...new Set(hierarchicalRows.map(r => r.level))].length,
        rows: hierarchicalRows,
        confidence: hierarchicalRows.length / data.length
      };
    }

    return null;
  }

  detectMatrix(data) {
    // Detect matrix structure (rows × columns with numerical data)
    if (data.length < 3 || !data[0] || data[0].length < 3) return null;

    // Check if we have row headers and column headers
    const hasRowHeaders = data.slice(1).every(row => 
      row[0] && typeof row[0] === 'string' && isNaN(row[0])
    );
    
    const hasColHeaders = data[0].slice(1).every(cell => 
      cell && typeof cell === 'string' && isNaN(cell)
    );

    if (hasRowHeaders && hasColHeaders) {
      // Check if inner cells are mostly numeric
      let numericCount = 0;
      let totalCount = 0;
      
      for (let r = 1; r < data.length; r++) {
        for (let c = 1; c < data[r].length; c++) {
          if (data[r][c] != null) {
            totalCount++;
            if (!isNaN(data[r][c])) numericCount++;
          }
        }
      }

      if (numericCount / totalCount > 0.7) {
        return {
          type: 'matrix',
          rowHeaders: data.slice(1).map(r => r[0]),
          columnHeaders: data[0].slice(1),
          dataRange: {
            startRow: 1,
            startCol: 1,
            endRow: data.length - 1,
            endCol: data[0].length - 1
          },
          confidence: numericCount / totalCount
        };
      }
    }

    return null;
  }

  findKeywords(sheetData) {
    const foundKeywords = {
      assets: [],
      liabilities: [],
      income: [],
      expenses: [],
      temporal: [],
      calculations: []
    };

    sheetData.cells.forEach((cell) => {
      if (typeof cell.value === 'string') {
        const cellLower = cell.value.toLowerCase();
        
        Object.keys(this.financialKeywords).forEach(category => {
          this.financialKeywords[category].forEach(keyword => {
            if (cellLower.includes(keyword)) {
              foundKeywords[category].push({
                keyword,
                position: cell.position,
                value: cell.value,
                confidence: this.calculateKeywordConfidence(cellLower, keyword)
              });
            }
          });
        });
      }
    });

    return foundKeywords;
  }

  analyzeDataTypes(sheetData) {
    const dataTypes = {
      currency: [],
      percentages: [],
      dates: [],
      numbers: [],
      text: [],
      formulas: [],
      empty: []
    };

    sheetData.cells.forEach((cell) => {
      const value = cell.value;
      const rawValue = cell.raw || String(value);
      
      if (value == null || value === '') {
        dataTypes.empty.push(cell.position);
      } else if (cell.formula) {
        dataTypes.formulas.push({
          position: cell.position,
          formula: cell.formula,
          value: value
        });
      } else if (this.patterns.currency.test(rawValue)) {
        dataTypes.currency.push({
          position: cell.position,
          value: value,
          formatted: rawValue
        });
      } else if (this.patterns.percentage.test(rawValue)) {
        dataTypes.percentages.push({
          position: cell.position,
          value: value,
          formatted: rawValue
        });
      } else if (cell.type === 'd' || this.patterns.date.test(rawValue)) {
        dataTypes.dates.push({
          position: cell.position,
          value: value,
          formatted: rawValue
        });
      } else if (typeof value === 'number') {
        dataTypes.numbers.push({
          position: cell.position,
          value: value,
          isNegative: value < 0
        });
      } else {
        dataTypes.text.push({
          position: cell.position,
          value: value
        });
      }
    });

    return dataTypes;
  }

  detectPatterns(sheetData) {
    const patterns = [];
    
    // Detect repeating patterns
    const repeatingPatterns = this.findRepeatingPatterns(sheetData.data);
    if (repeatingPatterns.length > 0) {
      patterns.push(...repeatingPatterns);
    }

    // Detect calculation patterns
    const calcPatterns = this.findCalculationPatterns(sheetData);
    if (calcPatterns.length > 0) {
      patterns.push(...calcPatterns);
    }

    // Detect grouping patterns
    const groupPatterns = this.findGroupingPatterns(sheetData.data);
    if (groupPatterns.length > 0) {
      patterns.push(...groupPatterns);
    }

    return patterns;
  }

  findRepeatingPatterns(data) {
    const patterns = [];
    
    // Look for repeating structures in rows
    const rowPatterns = new Map();
    
    data.forEach((row, index) => {
      const pattern = row.map(cell => {
        if (cell == null) return 'empty';
        if (typeof cell === 'number') return 'number';
        if (typeof cell === 'string') {
          if (this.isTemporalValue(cell)) return 'temporal';
          if (this.patterns.currency.test(cell)) return 'currency';
          return 'text';
        }
        return 'other';
      }).join('-');
      
      if (!rowPatterns.has(pattern)) {
        rowPatterns.set(pattern, []);
      }
      rowPatterns.get(pattern).push(index);
    });

    rowPatterns.forEach((rows, pattern) => {
      if (rows.length >= 3) {
        patterns.push({
          type: 'repeating',
          pattern: pattern,
          rows: rows,
          count: rows.length
        });
      }
    });

    return patterns;
  }

  findCalculationPatterns(sheetData) {
    const patterns = [];
    
    // Look for sum formulas
    sheetData.formulas.forEach(formula => {
      if (formula.formula.toUpperCase().includes('SUM')) {
        patterns.push({
          type: 'calculation',
          subtype: 'sum',
          position: formula.position,
          formula: formula.formula,
          value: formula.value
        });
      } else if (formula.formula.includes('+') || formula.formula.includes('-')) {
        patterns.push({
          type: 'calculation',
          subtype: 'arithmetic',
          position: formula.position,
          formula: formula.formula,
          value: formula.value
        });
      }
    });

    return patterns;
  }

  findGroupingPatterns(data) {
    const patterns = [];
    let currentGroup = null;
    
    data.forEach((row, index) => {
      const isEmpty = row.every(cell => cell == null || cell === '');
      
      if (isEmpty && currentGroup) {
        // End of group
        patterns.push(currentGroup);
        currentGroup = null;
      } else if (!isEmpty && !currentGroup) {
        // Start of new group
        currentGroup = {
          type: 'group',
          startRow: index,
          rows: [index]
        };
      } else if (!isEmpty && currentGroup) {
        // Continue group
        currentGroup.rows.push(index);
      }
    });

    if (currentGroup) {
      patterns.push(currentGroup);
    }

    return patterns.filter(g => g.rows.length > 1);
  }

  findRelationships(sheetData) {
    const relationships = [];
    
    // Find parent-child relationships based on formulas
    sheetData.formulas.forEach(formula => {
      const references = this.extractCellReferences(formula.formula);
      if (references.length > 0) {
        relationships.push({
          type: 'formula-dependency',
          source: formula.position,
          targets: references,
          formula: formula.formula
        });
      }
    });

    // Find total/subtotal relationships
    const data = sheetData.data;
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (typeof cell === 'string') {
          const cellLower = cell.toLowerCase();
          if (cellLower.includes('total') || cellLower.includes('sum')) {
            // Look for numeric value in same row
            const numericCells = row.slice(colIndex + 1)
              .map((v, i) => ({ value: v, index: colIndex + 1 + i }))
              .filter(c => typeof c.value === 'number');
            
            if (numericCells.length > 0) {
              relationships.push({
                type: 'total',
                labelPosition: { row: rowIndex, col: colIndex },
                valuePosition: { row: rowIndex, col: numericCells[0].index },
                label: cell,
                value: numericCells[0].value
              });
            }
          }
        }
      });
    });

    return relationships;
  }

  extractCellReferences(formula) {
    const references = [];
    const cellRefPattern = /[A-Z]+\d+/g;
    const matches = formula.match(cellRefPattern);
    
    if (matches) {
      references.push(...matches);
    }
    
    return [...new Set(references)];
  }

  isTemporalValue(value) {
    if (typeof value !== 'string') return false;
    const valueLower = value.toLowerCase();
    
    return this.financialKeywords.temporal.some(keyword => 
      valueLower.includes(keyword)
    );
  }

  detectColumnType(columnData) {
    const types = {
      currency: 0,
      number: 0,
      date: 0,
      text: 0,
      empty: 0
    };

    columnData.forEach(value => {
      if (value == null || value === '') {
        types.empty++;
      } else if (typeof value === 'number') {
        types.number++;
      } else if (typeof value === 'string') {
        if (this.patterns.currency.test(value)) {
          types.currency++;
        } else if (this.patterns.date.test(value)) {
          types.date++;
        } else {
          types.text++;
        }
      }
    });

    // Return the most common type
    const maxType = Object.keys(types).reduce((a, b) => 
      types[a] > types[b] ? a : b
    );

    return maxType;
  }

  calculateKeywordConfidence(text, keyword) {
    // Exact match gets higher confidence
    if (text === keyword) return 1.0;
    
    // Word boundary match
    const wordBoundaryPattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (wordBoundaryPattern.test(text)) return 0.9;
    
    // Partial match
    if (text.includes(keyword)) return 0.7;
    
    return 0.5;
  }

  calculateConfidence(analysis) {
    let score = 0;
    let factors = 0;

    // Structure confidence
    if (analysis.structures.length > 0) {
      const structureScore = analysis.structures.reduce((sum, s) => 
        sum + (s.confidence || 0.5), 0
      ) / analysis.structures.length;
      score += structureScore;
      factors++;
    }

    // Keyword confidence
    const totalKeywords = Object.values(analysis.keywords).reduce((sum, arr) => 
      sum + arr.length, 0
    );
    if (totalKeywords > 0) {
      score += Math.min(totalKeywords / 10, 1);
      factors++;
    }

    // Data type diversity
    const nonEmptyTypes = Object.keys(analysis.dataTypes).filter(type => 
      type !== 'empty' && analysis.dataTypes[type].length > 0
    ).length;
    if (nonEmptyTypes > 0) {
      score += nonEmptyTypes / 6;
      factors++;
    }

    // Pattern detection
    if (analysis.patterns.length > 0) {
      score += Math.min(analysis.patterns.length / 5, 1);
      factors++;
    }

    // Relationships
    if (analysis.relationships.length > 0) {
      score += Math.min(analysis.relationships.length / 5, 1);
      factors++;
    }

    return factors > 0 ? (score / factors) * 100 : 0;
  }
}

export default PatternRecognitionEngine;