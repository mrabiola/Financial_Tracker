import ExcelParser from './excelParser.js';
import PatternRecognitionEngine from './patternRecognition.js';
import AIClassificationEngine from './aiClassification.js';
import LLMClassificationEngine from './llmClassification.js';
import LearningSystem from './learningSystem.js';
import DataTransformationPipeline from './dataTransformation.js';
import ErrorHandler from './errorHandling.js';
import AdvancedFeatures from './advancedFeatures.js';
import PerformanceOptimizer from './performanceOptimizations.js';

export class MasterImportEngine {
  constructor(options = {}) {
    this.options = {
      enableWorkers: true,
      enableCaching: true,
      enableLearning: true,
      enableLLM: true, // Enable LLM-powered classification by default
      performanceMode: 'balanced', // 'speed', 'balanced', 'memory'
      ...options
    };

    // Initialize core components
    this.parser = new ExcelParser();
    this.patternEngine = new PatternRecognitionEngine();
    this.aiEngine = new AIClassificationEngine();
    this.llmEngine = new LLMClassificationEngine(); // LLM-powered classification
    this.learningSystem = new LearningSystem();
    this.transformer = new DataTransformationPipeline();
    this.errorHandler = new ErrorHandler();
    this.advancedFeatures = new AdvancedFeatures();
    this.optimizer = new PerformanceOptimizer();

    // Initialize performance optimizations
    if (this.options.enableWorkers) {
      this.optimizer.initializeWorkerPool();
    }

    // Pipeline state
    this.pipelineState = {
      currentPhase: null,
      progress: 0,
      status: 'ready'
    };

    this.progressCallbacks = new Set();
  }

  // Main import pipeline
  async processFile(file, userOptions = {}) {
    const startTime = Date.now();
    this.updateProgress('initializing', 0);

    const options = {
      mapping: null,
      autoMapping: true,
      validateData: true,
      enableLearning: this.options.enableLearning,
      enableCaching: this.options.enableCaching,
      ...userOptions
    };

    const result = {
      success: false,
      data: null,
      metadata: {},
      errors: [],
      warnings: [],
      performance: {},
      confidence: 0,
      pipeline: {
        phases: [],
        totalTime: 0
      }
    };

    try {
      // Phase 1: File Validation and Parsing
      this.updateProgress('parsing', 10);
      const parseResult = await this.executePhase('parse', async () => {
        // Validate file first
        const validation = this.errorHandler.validateFileStructure(file);
        if (!validation.valid) {
          throw new Error(validation.errors.map(e => e.message).join(', '));
        }

        // Check cache
        if (options.enableCaching) {
          const cacheKey = this.optimizer.generateCacheKey(file, options);
          const cached = this.optimizer.getCachedResult(cacheKey);
          if (cached) {
            return { fromCache: true, ...cached };
          }
        }

        // Parse file
        return await this.parser.parseFile(file);
      });

      if (parseResult.fromCache) {
        result.metadata.fromCache = true;
        result.data = parseResult.data;
        result.success = true;
        return result;
      }

      result.data = parseResult;
      this.updateProgress('analyzing', 25);

      // Phase 2: Pattern Recognition and Analysis
      const analysisResult = await this.executePhase('analyze', async () => {
        const sheets = parseResult.rawData.sheets;
        const allAnalysis = [];

        for (let i = 0; i < sheets.length; i++) {
          const sheetAnalysis = await this.analyzeSheet(sheets[i], i, sheets.length);
          allAnalysis.push(sheetAnalysis);
        }

        return allAnalysis;
      });

      this.updateProgress('classifying', 40);

      // Phase 3: AI Classification and Smart Mapping
      const classificationResult = await this.executePhase('classify', async () => {
        const sheets = parseResult.rawData.sheets;
        const allClassifications = [];

        for (let i = 0; i < sheets.length; i++) {
          const classification = await this.classifySheet(
            sheets[i], 
            analysisResult[i], 
            i, 
            sheets.length
          );
          allClassifications.push(classification);
        }

        return allClassifications;
      });

      this.updateProgress('mapping', 55);

      // Phase 4: Intelligent Mapping
      const mappingResult = await this.executePhase('mapping', async () => {
        let finalMapping = options.mapping;

        if (!finalMapping && options.autoMapping) {
          // Use AI to create smart mapping
          finalMapping = await this.createIntelligentMapping(
            parseResult.rawData.sheets[0],
            analysisResult[0],
            classificationResult[0],
            file.name
          );
        }

        // Validate mapping
        const mappingValidation = this.errorHandler.validateMapping(
          finalMapping, 
          parseResult.rawData.sheets[0].data[0]
        );

        if (!mappingValidation.valid) {
          throw new Error('Invalid mapping: ' + mappingValidation.errors.map(e => e.message).join(', '));
        }

        return finalMapping;
      });

      this.updateProgress('transforming', 70);

      // Phase 5: Data Transformation
      const transformResult = await this.executePhase('transform', async () => {
        const schema = this.createTransformationSchema(options);
        return this.transformer.transformData(
          parseResult.rawData.sheets[0],
          mappingResult,
          schema
        );
      });

      this.updateProgress('validating', 85);

      // Phase 6: Validation and Quality Assurance
      const validationResult = await this.executePhase('validate', async () => {
        if (!options.validateData) {
          return { valid: true, errors: [], warnings: [] };
        }

        return this.errorHandler.validateData(
          parseResult.rawData.sheets[0].data,
          mappingResult
        );
      });

      this.updateProgress('learning', 95);

      // Phase 7: Learning and Template Creation
      if (options.enableLearning && transformResult.statistics.qualityScore > 80) {
        await this.executePhase('learning', async () => {
          const fileSignature = this.learningSystem.generateFileSignature(
            parseResult.rawData.sheets[0],
            analysisResult[0]
          );

          this.learningSystem.saveSuccessfulMapping(
            fileSignature,
            mappingResult,
            file.name
          );

          return { learned: true };
        });
      }

      // Finalize results
      this.updateProgress('complete', 100);

      result.success = true;
      result.data = {
        accounts: transformResult.accounts,
        transactions: transformResult.transactions,
        metadata: transformResult.metadata,
        statistics: transformResult.statistics
      };

      result.metadata = {
        ...transformResult.metadata,
        fileName: file.name,
        fileSize: file.size,
        processingTime: Date.now() - startTime,
        pipeline: result.pipeline,
        mapping: mappingResult,
        analysis: analysisResult[0],
        classification: classificationResult[0]
      };

      result.confidence = this.calculateOverallConfidence(
        analysisResult[0],
        classificationResult[0],
        transformResult.statistics
      );

      result.errors = transformResult.errors || [];
      result.warnings = [
        ...this.errorHandler.getWarnings(),
        ...(transformResult.warnings || []),
        ...(validationResult.warnings || [])
      ];

      // Cache successful result
      if (options.enableCaching && result.success) {
        const cacheKey = this.optimizer.generateCacheKey(file, options);
        this.optimizer.setCachedResult(cacheKey, result);
      }

    } catch (error) {
      result.success = false;
      result.error = error.message;
      result.errors.push({
        type: 'pipeline',
        message: error.message,
        phase: this.pipelineState.currentPhase
      });

      // Try error recovery
      const recovery = this.errorHandler.handleError(error, {
        file,
        options,
        phase: this.pipelineState.currentPhase
      });

      result.recovery = recovery;
    } finally {
      result.pipeline.totalTime = Date.now() - startTime;
      this.updateProgress('complete', 100);
    }

    return result;
  }

  async executePhase(phaseName, phaseFunction) {
    const phaseStart = Date.now();
    this.pipelineState.currentPhase = phaseName;

    try {
      const result = await phaseFunction();
      const phaseTime = Date.now() - phaseStart;
      
      this.pipelineState.pipeline?.phases?.push({
        name: phaseName,
        duration: phaseTime,
        success: true
      });

      return result;
    } catch (error) {
      const phaseTime = Date.now() - phaseStart;
      
      this.pipelineState.pipeline?.phases?.push({
        name: phaseName,
        duration: phaseTime,
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  async analyzeSheet(sheetData, sheetIndex, totalSheets) {
    this.updateProgress(`analyzing sheet ${sheetIndex + 1}/${totalSheets}`, 
      25 + (sheetIndex / totalSheets) * 10);

    if (this.options.enableWorkers) {
      return await this.optimizer.executeInWorker('analyzePatterns', {
        sheetData,
        patterns: sheetData.cells
      });
    } else {
      return this.patternEngine.analyzeSheet(sheetData);
    }
  }

  async classifySheet(sheetData, analysis, sheetIndex, totalSheets) {
    this.updateProgress(`classifying sheet ${sheetIndex + 1}/${totalSheets}`,
      40 + (sheetIndex / totalSheets) * 10);

    // Use LLM classification if enabled, otherwise fall back to keyword-based
    if (this.options.enableLLM && this.llmEngine.isLLMAvailable()) {
      try {
        return await this.llmEngine.classifySheet(sheetData, analysis, { useLLM: true });
      } catch (error) {
        console.warn('LLM classification failed, using fallback:', error.message);
        return this.aiEngine.classifySheet(sheetData, analysis);
      }
    } else if (this.options.enableWorkers) {
      return await this.optimizer.executeInWorker('classifyData', {
        sheetData,
        analysis
      });
    } else {
      return this.aiEngine.classifySheet(sheetData, analysis);
    }
  }

  async createIntelligentMapping(sheetData, analysis, classification, fileName) {
    // Start with AI suggestions
    let mapping = {};

    if (classification.suggestedMappings.length > 0) {
      const bestSuggestion = classification.suggestedMappings.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      if (bestSuggestion.type === 'time_series') {
        mapping = {
          structure: 'monthly',
          accountColumn: bestSuggestion.accountColumn,
          monthColumns: {}
        };
        
        // Map temporal columns
        classification.temporalMappings.forEach(temporal => {
          if (temporal.period !== null) {
            mapping.monthColumns[temporal.period] = temporal.columnIndex;
          }
        });
      } else {
        mapping = {
          structure: 'single',
          accountColumn: bestSuggestion.accountColumn,
          valueColumn: bestSuggestion.valueColumn,
          categoryColumn: bestSuggestion.categoryColumn
        };
      }
    }

    // Check learning system for similar files
    if (this.options.enableLearning) {
      const fileSignature = this.learningSystem.generateFileSignature(sheetData, analysis);
      const matchingTemplate = this.learningSystem.findMatchingTemplate(fileSignature);
      
      if (matchingTemplate && matchingTemplate.matchScore > 0.8) {
        // Use learned template but merge with AI suggestions
        mapping = this.mergeMappings(mapping, matchingTemplate.mapping);
      }
    }

    // Detect common export formats
    const formatDetection = this.advancedFeatures.detectBankExportFormat(sheetData);
    if (formatDetection.confidence > 0.7) {
      const formatMapping = this.getFormatMapping(formatDetection.format);
      mapping = this.mergeMappings(mapping, formatMapping);
    }

    return mapping;
  }

  mergeMappings(mapping1, mapping2) {
    const merged = { ...mapping1 };
    
    // Use mapping2 values if mapping1 doesn't have them or has lower confidence
    Object.keys(mapping2).forEach(key => {
      if (merged[key] === undefined || merged[key] === null) {
        merged[key] = mapping2[key];
      }
    });

    return merged;
  }

  getFormatMapping(format) {
    const formatMappings = {
      'quicken': {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 1,
        categoryColumn: 2,
        dateColumn: 3
      },
      'mint': {
        structure: 'single',
        accountColumn: 6,
        valueColumn: 3,
        categoryColumn: 5,
        dateColumn: 0
      },
      'personal_capital': {
        structure: 'single',
        accountColumn: 0,
        valueColumn: 2,
        categoryColumn: 4
      }
    };

    return formatMappings[format] || {};
  }

  createTransformationSchema(options) {
    return {
      cleaningRules: {
        removeEmptyRows: true,
        trimStrings: true,
        standardizeNumbers: true,
        validateDates: true
      },
      validationRules: {
        requireAccountName: true,
        requireNumericValues: true,
        allowNegativeValues: true,
        maxAccountNameLength: 100
      },
      enrichmentRules: {
        autoDetectAccountTypes: true,
        standardizeCategories: true,
        calculateConfidence: true
      },
      normalizationRules: {
        currencyFormat: 'USD',
        dateFormat: 'ISO',
        numberPrecision: 2
      }
    };
  }

  calculateOverallConfidence(analysis, classification, statistics) {
    const factors = [
      analysis.confidence || 0,
      classification.confidence || 0,
      statistics.qualityScore || 0
    ];

    const weights = [0.3, 0.4, 0.3];
    
    return factors.reduce((sum, factor, index) => 
      sum + (factor * weights[index]), 0
    );
  }

  // Multi-file import
  async processMultipleFiles(files, options = {}) {
    this.updateProgress('multi_file_init', 0);
    
    const multiOptions = {
      deduplication: 'smart',
      incrementalMode: false,
      ...options
    };

    return await this.advancedFeatures.importMultipleFiles(files, multiOptions);
  }

  // Incremental update
  async performIncrementalUpdate(newData, existingData, options = {}) {
    return await this.advancedFeatures.performIncrementalUpdate(
      newData, 
      existingData, 
      options
    );
  }

  // Progress management
  addProgressCallback(callback) {
    this.progressCallbacks.add(callback);
  }

  removeProgressCallback(callback) {
    this.progressCallbacks.delete(callback);
  }

  updateProgress(phase, percentage) {
    this.pipelineState.currentPhase = phase;
    this.pipelineState.progress = percentage;
    
    this.progressCallbacks.forEach(callback => {
      try {
        callback({
          phase,
          percentage,
          status: this.pipelineState.status
        });
      } catch (error) {
        console.error('Progress callback error:', error);
      }
    });
  }

  // Template management
  getTemplateLibrary() {
    return this.learningSystem.getTemplateLibrary();
  }

  deleteTemplate(templateKey) {
    return this.learningSystem.deleteTemplate(templateKey);
  }

  exportLearningData() {
    return this.learningSystem.exportLearningData();
  }

  importLearningData(data) {
    return this.learningSystem.importLearningData(data);
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      cacheSize: this.optimizer.cacheManager.size(),
      memoryUsage: this.optimizer.memoryManager.getCurrentUsage(),
      workerPoolSize: this.optimizer.workerPool?.workers?.length || 0,
      processedFiles: this.getProcessedFileCount(),
      averageProcessingTime: this.getAverageProcessingTime()
    };
  }

  getProcessedFileCount() {
    // This would typically be stored in a more persistent way
    return parseInt(localStorage.getItem('excel_import_file_count') || '0');
  }

  incrementProcessedFileCount() {
    const count = this.getProcessedFileCount() + 1;
    localStorage.setItem('excel_import_file_count', count.toString());
  }

  getAverageProcessingTime() {
    // This would typically be calculated from stored metrics
    return parseFloat(localStorage.getItem('excel_import_avg_time') || '0');
  }

  updateAverageProcessingTime(newTime) {
    const currentAvg = this.getAverageProcessingTime();
    const count = this.getProcessedFileCount();
    const newAvg = count > 1 ? ((currentAvg * (count - 1)) + newTime) / count : newTime;
    localStorage.setItem('excel_import_avg_time', newAvg.toString());
  }

  // Error recovery
  async retryWithRecovery(file, originalError, recoveryOptions = {}) {
    console.log('Attempting recovery for error:', originalError.message);
    
    const recovery = this.errorHandler.handleError(originalError, {
      file,
      ...recoveryOptions
    });

    if (recovery.success && recovery.action === 'retry') {
      // Implement specific recovery strategies
      const newOptions = { ...recoveryOptions };
      
      if (recovery.suggestions) {
        recovery.suggestions.forEach(suggestion => {
          if (suggestion.type === 'alternative_columns') {
            // Use suggested alternative columns
            newOptions.mapping = {
              ...newOptions.mapping,
              accountColumn: suggestion.columns[0]?.index
            };
          }
        });
      }

      return await this.processFile(file, newOptions);
    }

    return { success: false, error: originalError.message, recovery };
  }

  // Cleanup
  cleanup() {
    this.optimizer.cleanup();
    this.learningSystem = new LearningSystem(); // Reset learning system
    this.progressCallbacks.clear();
  }

  // Development and testing utilities
  async runDiagnostics(file) {
    const diagnostics = {
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      },
      parsing: null,
      analysis: null,
      classification: null,
      performance: null,
      recommendations: []
    };

    try {
      // Test parsing
      const parseStart = Date.now();
      const parseResult = await this.parser.parseFile(file);
      diagnostics.parsing = {
        success: true,
        time: Date.now() - parseStart,
        sheets: parseResult.rawData.sheets.length,
        cells: parseResult.rawData.sheets[0]?.cells.size || 0
      };

      // Test analysis
      const analysisStart = Date.now();
      const analysis = this.patternEngine.analyzeSheet(parseResult.rawData.sheets[0]);
      diagnostics.analysis = {
        success: true,
        time: Date.now() - analysisStart,
        confidence: analysis.confidence,
        patterns: analysis.patterns.length,
        structures: analysis.structures.length
      };

      // Test classification
      const classificationStart = Date.now();
      const classification = this.aiEngine.classifySheet(parseResult.rawData.sheets[0], analysis);
      diagnostics.classification = {
        success: true,
        time: Date.now() - classificationStart,
        confidence: classification.confidence,
        suggestions: classification.suggestedMappings.length
      };

      // Performance recommendations
      if (diagnostics.parsing.time > 5000) {
        diagnostics.recommendations.push('Consider enabling Web Workers for better performance');
      }

      if (diagnostics.fileInfo.size > 10 * 1024 * 1024) {
        diagnostics.recommendations.push('Large file detected - streaming parser recommended');
      }

    } catch (error) {
      diagnostics.error = error.message;
    }

    return diagnostics;
  }
}

export default MasterImportEngine;