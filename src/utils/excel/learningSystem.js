export class LearningSystem {
  constructor() {
    this.templates = new Map();
    this.userCorrections = new Map();
    this.commonPatterns = new Map();
    this.fileSignatures = new Map();
    this.loadStoredLearning();
  }

  loadStoredLearning() {
    try {
      const storedTemplates = localStorage.getItem('excel-import-templates');
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        Object.entries(templates).forEach(([key, value]) => {
          this.templates.set(key, value);
        });
      }

      const storedCorrections = localStorage.getItem('excel-import-corrections');
      if (storedCorrections) {
        const corrections = JSON.parse(storedCorrections);
        Object.entries(corrections).forEach(([key, value]) => {
          this.userCorrections.set(key, value);
        });
      }

      const storedPatterns = localStorage.getItem('excel-import-patterns');
      if (storedPatterns) {
        const patterns = JSON.parse(storedPatterns);
        Object.entries(patterns).forEach(([key, value]) => {
          this.commonPatterns.set(key, value);
        });
      }

      this.initializeDefaultTemplates();
    } catch (error) {
      console.warn('Error loading stored learning data:', error);
      this.initializeDefaultTemplates();
    }
  }

  saveStoredLearning() {
    try {
      localStorage.setItem('excel-import-templates', JSON.stringify(Object.fromEntries(this.templates)));
      localStorage.setItem('excel-import-corrections', JSON.stringify(Object.fromEntries(this.userCorrections)));
      localStorage.setItem('excel-import-patterns', JSON.stringify(Object.fromEntries(this.commonPatterns)));
    } catch (error) {
      console.warn('Error saving learning data:', error);
    }
  }

  initializeDefaultTemplates() {
    // Default templates for common financial software exports
    const defaultTemplates = {
      'quicken_export': {
        name: 'Quicken Export',
        description: 'Standard Quicken account export format',
        signature: ['account', 'balance', 'type'],
        mapping: {
          structure: 'single',
          accountColumn: 0,
          valueColumn: 1,
          categoryColumn: 2
        },
        confidence: 0.9,
        usageCount: 0
      },
      'mint_export': {
        name: 'Mint Export',
        description: 'Mint.com account export format',
        signature: ['account name', 'account type', 'current balance'],
        mapping: {
          structure: 'single',
          accountColumn: 0,
          categoryColumn: 1,
          valueColumn: 2
        },
        confidence: 0.9,
        usageCount: 0
      },
      'personal_capital': {
        name: 'Personal Capital Export',
        description: 'Personal Capital account export',
        signature: ['account', 'institution', 'balance', 'type'],
        mapping: {
          structure: 'single',
          accountColumn: 0,
          valueColumn: 2,
          categoryColumn: 3
        },
        confidence: 0.9,
        usageCount: 0
      },
      'bank_statement': {
        name: 'Bank Statement',
        description: 'Standard bank statement format',
        signature: ['date', 'description', 'amount', 'balance'],
        mapping: {
          structure: 'single',
          accountColumn: 1,
          valueColumn: 2,
          dateColumn: 0
        },
        confidence: 0.8,
        usageCount: 0
      },
      'net_worth_tracker': {
        name: 'Net Worth Tracker',
        description: 'Monthly net worth tracking spreadsheet',
        signature: ['account', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        mapping: {
          structure: 'monthly',
          accountColumn: 0,
          monthColumns: {
            0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6,
            6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12
          }
        },
        confidence: 0.95,
        usageCount: 0
      }
    };

    Object.entries(defaultTemplates).forEach(([key, template]) => {
      if (!this.templates.has(key)) {
        this.templates.set(key, template);
      }
    });
  }

  generateFileSignature(sheetData, analysis) {
    const signature = {
      headers: [],
      columnTypes: [],
      dataPatterns: [],
      keywordScore: {},
      structureType: null
    };

    // Extract header signature
    if (sheetData.data && sheetData.data[0]) {
      signature.headers = sheetData.data[0]
        .map(header => this.normalizeHeaderText(header))
        .filter(h => h);
    }

    // Extract column type patterns
    if (analysis.structures.length > 0) {
      const tableStructure = analysis.structures.find(s => s.type === 'table');
      if (tableStructure) {
        signature.columnTypes = tableStructure.columns.map(col => col.type);
        signature.structureType = 'table';
      }

      const timeSeriesStructure = analysis.structures.find(s => s.type === 'timeSeries');
      if (timeSeriesStructure) {
        signature.structureType = 'timeSeries';
      }
    }

    // Extract keyword scores
    Object.keys(analysis.keywords).forEach(category => {
      signature.keywordScore[category] = analysis.keywords[category].length;
    });

    // Extract data patterns
    signature.dataPatterns = analysis.patterns.map(p => p.type);

    return signature;
  }

  findMatchingTemplate(fileSignature) {
    let bestMatch = null;
    let bestScore = 0;

    this.templates.forEach((template, key) => {
      const score = this.calculateTemplateMatch(fileSignature, template);
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = { ...template, key, matchScore: score };
      }
    });

    return bestMatch;
  }

  calculateTemplateMatch(fileSignature, template) {
    let score = 0;
    let factors = 0;

    // Header similarity
    if (template.signature && fileSignature.headers) {
      const headerSimilarity = this.calculateHeaderSimilarity(
        fileSignature.headers,
        template.signature
      );
      score += headerSimilarity * 0.4;
      factors += 0.4;
    }

    // Structure type match
    if (template.mapping && template.mapping.structure) {
      if (fileSignature.structureType === 'table' && template.mapping.structure === 'single') {
        score += 0.3;
      } else if (fileSignature.structureType === 'timeSeries' && template.mapping.structure === 'monthly') {
        score += 0.3;
      }
      factors += 0.3;
    }

    // Keyword score similarity
    if (template.keywordProfile && fileSignature.keywordScore) {
      const keywordSimilarity = this.calculateKeywordSimilarity(
        fileSignature.keywordScore,
        template.keywordProfile
      );
      score += keywordSimilarity * 0.2;
      factors += 0.2;
    }

    // Usage boost (templates that worked before get higher priority)
    if (template.usageCount > 0) {
      score += Math.min(template.usageCount * 0.01, 0.1);
    }

    return factors > 0 ? score / factors : 0;
  }

  calculateHeaderSimilarity(headers1, headers2) {
    const normalized1 = headers1.map(h => this.normalizeHeaderText(h));
    const normalized2 = headers2.map(h => this.normalizeHeaderText(h));

    let matches = 0;
    const maxLength = Math.max(normalized1.length, normalized2.length);

    normalized1.forEach(header1 => {
      const bestMatch = normalized2.reduce((best, header2) => {
        const similarity = this.calculateStringSimilarity(header1, header2);
        return similarity > best ? similarity : best;
      }, 0);

      if (bestMatch > 0.8) {
        matches++;
      }
    });

    return maxLength > 0 ? matches / maxLength : 0;
  }

  calculateKeywordSimilarity(keywords1, keywords2) {
    const categories = Object.keys(keywords1);
    if (categories.length === 0) return 0;

    let totalSimilarity = 0;
    categories.forEach(category => {
      const score1 = keywords1[category] || 0;
      const score2 = keywords2[category] || 0;
      const maxScore = Math.max(score1, score2, 1);
      const similarity = 1 - Math.abs(score1 - score2) / maxScore;
      totalSimilarity += similarity;
    });

    return totalSimilarity / categories.length;
  }

  calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  normalizeHeaderText(text) {
    if (typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  saveSuccessfulMapping(fileSignature, mapping, filename) {
    const templateKey = this.generateTemplateKey(fileSignature);
    
    const template = {
      name: `Custom Template - ${filename}`,
      description: `Generated from successful import of ${filename}`,
      signature: fileSignature.headers,
      mapping: mapping,
      keywordProfile: fileSignature.keywordScore,
      structureType: fileSignature.structureType,
      confidence: 0.8,
      usageCount: 1,
      createdDate: new Date().toISOString(),
      filename: filename
    };

    // Check if similar template exists
    const existing = this.findMatchingTemplate(fileSignature);
    if (existing && existing.matchScore > 0.9) {
      // Update existing template
      existing.usageCount++;
      existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
      this.templates.set(existing.key, existing);
    } else {
      // Create new template
      this.templates.set(templateKey, template);
    }

    this.saveStoredLearning();
  }

  saveUserCorrection(originalMapping, correctedMapping, fileSignature) {
    const correctionKey = this.generateCorrectionKey(originalMapping, fileSignature);
    
    const correction = {
      originalMapping,
      correctedMapping,
      fileSignature,
      timestamp: new Date().toISOString(),
      applied: false
    };

    this.userCorrections.set(correctionKey, correction);
    this.saveStoredLearning();
  }

  applyCorrectionLearning(fileSignature) {
    const corrections = [];
    
    this.userCorrections.forEach((correction, key) => {
      const similarity = this.calculateTemplateMatch(fileSignature, {
        signature: correction.fileSignature.headers,
        keywordProfile: correction.fileSignature.keywordScore
      });

      if (similarity > 0.8) {
        corrections.push({
          ...correction,
          similarity,
          key
        });
      }
    });

    // Sort by similarity and return best corrections
    return corrections
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(c => c.correctedMapping);
  }

  identifyCommonPatterns() {
    const patterns = {
      headerPatterns: new Map(),
      mappingPatterns: new Map(),
      structurePatterns: new Map()
    };

    // Analyze all templates for common patterns
    this.templates.forEach(template => {
      // Header patterns
      if (template.signature) {
        template.signature.forEach(header => {
          const normalized = this.normalizeHeaderText(header);
          patterns.headerPatterns.set(
            normalized,
            (patterns.headerPatterns.get(normalized) || 0) + 1
          );
        });
      }

      // Mapping patterns
      if (template.mapping) {
        const mappingKey = this.serializeMapping(template.mapping);
        patterns.mappingPatterns.set(
          mappingKey,
          (patterns.mappingPatterns.get(mappingKey) || 0) + 1
        );
      }

      // Structure patterns
      if (template.structureType) {
        patterns.structurePatterns.set(
          template.structureType,
          (patterns.structurePatterns.get(template.structureType) || 0) + 1
        );
      }
    });

    this.commonPatterns = patterns;
    this.saveStoredLearning();
    return patterns;
  }

  generateSmartSuggestions(fileSignature, currentMapping) {
    const suggestions = [];

    // Template-based suggestions
    const matchingTemplate = this.findMatchingTemplate(fileSignature);
    if (matchingTemplate) {
      suggestions.push({
        type: 'template',
        source: matchingTemplate.name,
        mapping: matchingTemplate.mapping,
        confidence: matchingTemplate.matchScore,
        description: `Based on template: ${matchingTemplate.description}`
      });
    }

    // Correction-based suggestions
    const corrections = this.applyCorrectionLearning(fileSignature);
    corrections.forEach((correction, index) => {
      suggestions.push({
        type: 'correction',
        source: 'User Corrections',
        mapping: correction,
        confidence: 0.8 - (index * 0.1),
        description: 'Based on previous user corrections to similar files'
      });
    });

    // Pattern-based suggestions
    const patternSuggestions = this.generatePatternBasedSuggestions(fileSignature);
    suggestions.push(...patternSuggestions);

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  generatePatternBasedSuggestions(fileSignature) {
    const suggestions = [];
    
    // Common header patterns
    if (fileSignature.headers) {
      fileSignature.headers.forEach((header, index) => {
        const normalized = this.normalizeHeaderText(header);
        
        // Check against common account name patterns
        if (this.isLikelyAccountColumn(normalized)) {
          suggestions.push({
            type: 'pattern',
            source: 'Header Pattern',
            mapping: { accountColumn: index },
            confidence: 0.7,
            description: `"${header}" looks like an account name column`
          });
        }

        // Check against common amount patterns
        if (this.isLikelyAmountColumn(normalized)) {
          suggestions.push({
            type: 'pattern',
            source: 'Header Pattern',
            mapping: { valueColumn: index },
            confidence: 0.7,
            description: `"${header}" looks like an amount column`
          });
        }

        // Check against temporal patterns
        if (this.isLikelyTemporalColumn(normalized)) {
          suggestions.push({
            type: 'pattern',
            source: 'Header Pattern',
            mapping: { temporalColumn: index },
            confidence: 0.8,
            description: `"${header}" looks like a time period column`
          });
        }
      });
    }

    return suggestions;
  }

  isLikelyAccountColumn(headerText) {
    const accountKeywords = ['account', 'name', 'description', 'item', 'category'];
    return accountKeywords.some(keyword => headerText.includes(keyword));
  }

  isLikelyAmountColumn(headerText) {
    const amountKeywords = ['amount', 'balance', 'value', 'total', 'sum', 'cost', 'price'];
    return amountKeywords.some(keyword => headerText.includes(keyword));
  }

  isLikelyTemporalColumn(headerText) {
    const temporalKeywords = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'month', 'date', 'year', 'quarter'];
    return temporalKeywords.some(keyword => headerText.includes(keyword));
  }

  generateTemplateKey(fileSignature) {
    const keyParts = [
      fileSignature.headers ? fileSignature.headers.slice(0, 3).join('_') : 'unknown',
      fileSignature.structureType || 'unknown',
      Date.now()
    ];
    return keyParts.join('_').replace(/[^a-z0-9_]/gi, '').toLowerCase();
  }

  generateCorrectionKey(mapping, fileSignature) {
    const keyParts = [
      'correction',
      fileSignature.headers ? fileSignature.headers[0] : 'unknown',
      mapping.structure || 'unknown',
      Date.now()
    ];
    return keyParts.join('_').replace(/[^a-z0-9_]/gi, '').toLowerCase();
  }

  serializeMapping(mapping) {
    return JSON.stringify({
      structure: mapping.structure,
      hasAccount: !!mapping.accountColumn,
      hasValue: !!mapping.valueColumn,
      hasMonthly: !!mapping.monthColumns,
      monthCount: mapping.monthColumns ? Object.keys(mapping.monthColumns).length : 0
    });
  }

  getTemplateLibrary() {
    return Array.from(this.templates.entries()).map(([key, template]) => ({
      ...template,
      key
    })).sort((a, b) => b.usageCount - a.usageCount);
  }

  deleteTemplate(templateKey) {
    this.templates.delete(templateKey);
    this.saveStoredLearning();
  }

  exportLearningData() {
    return {
      templates: Object.fromEntries(this.templates),
      corrections: Object.fromEntries(this.userCorrections),
      patterns: Object.fromEntries(this.commonPatterns),
      exportDate: new Date().toISOString()
    };
  }

  importLearningData(data) {
    try {
      if (data.templates) {
        Object.entries(data.templates).forEach(([key, template]) => {
          this.templates.set(key, template);
        });
      }

      if (data.corrections) {
        Object.entries(data.corrections).forEach(([key, correction]) => {
          this.userCorrections.set(key, correction);
        });
      }

      if (data.patterns) {
        Object.entries(data.patterns).forEach(([key, pattern]) => {
          this.commonPatterns.set(key, pattern);
        });
      }

      this.saveStoredLearning();
      return true;
    } catch (error) {
      console.error('Error importing learning data:', error);
      return false;
    }
  }

  clearLearningData() {
    this.templates.clear();
    this.userCorrections.clear();
    this.commonPatterns.clear();
    
    localStorage.removeItem('excel-import-templates');
    localStorage.removeItem('excel-import-corrections');
    localStorage.removeItem('excel-import-patterns');
    
    this.initializeDefaultTemplates();
  }

  getStats() {
    return {
      templateCount: this.templates.size,
      correctionCount: this.userCorrections.size,
      patternCount: this.commonPatterns.size,
      mostUsedTemplate: this.getMostUsedTemplate(),
      recentCorrections: this.getRecentCorrections(5)
    };
  }

  getMostUsedTemplate() {
    let mostUsed = null;
    let maxUsage = 0;

    this.templates.forEach((template, key) => {
      if (template.usageCount > maxUsage) {
        maxUsage = template.usageCount;
        mostUsed = { ...template, key };
      }
    });

    return mostUsed;
  }

  getRecentCorrections(limit = 5) {
    return Array.from(this.userCorrections.entries())
      .map(([key, correction]) => ({ ...correction, key }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

export default LearningSystem;