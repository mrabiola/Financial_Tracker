// Main exports for the Advanced Excel Import System
export { default as MasterImportEngine } from './masterImportEngine.js';
export { default as ExcelParser } from './excelParser.js';
export { default as PatternRecognitionEngine } from './patternRecognition.js';
export { default as AIClassificationEngine } from './aiClassification.js';
export { default as LearningSystem } from './learningSystem.js';
export { default as DataTransformationPipeline } from './dataTransformation.js';
export { default as ErrorHandler } from './errorHandling.js';
export { default as AdvancedFeatures } from './advancedFeatures.js';
export { default as PerformanceOptimizer } from './performanceOptimizations.js';
export { default as TestDataHandlers } from './testDataHandlers.js';

// Re-export the main modal component
export { default as AdvancedImportModal } from '../../components/dashboard/AdvancedImportModal.jsx';

// Utility function to create a configured import engine
export const createImportEngine = (options = {}) => {
  return new MasterImportEngine({
    enableWorkers: true,
    enableCaching: true,
    enableLearning: true,
    performanceMode: 'balanced',
    ...options
  });
};

// Utility function for quick file processing
export const quickImport = async (file, options = {}) => {
  const engine = createImportEngine(options);
  return await engine.processFile(file, {
    autoMapping: true,
    validateData: true,
    ...options
  });
};

// Export version info
export const VERSION = '1.0.0';
export const FEATURES = [
  'AI-Powered Pattern Recognition',
  'Automatic Structure Detection',
  'Smart Column Mapping',
  'Learning System with Templates',
  'Multi-file Import with Deduplication',
  'Incremental Updates',
  'Performance Optimization with Web Workers',
  'Comprehensive Error Handling',
  'Support for Multiple Excel Formats',
  'Bank Export Format Detection',
  'Real-time Progress Tracking',
  'Data Validation and Quality Assurance'
];

// Export configuration presets
export const PRESETS = {
  // Fast processing with minimal features
  SPEED: {
    enableWorkers: true,
    enableCaching: true,
    enableLearning: false,
    performanceMode: 'speed'
  },
  
  // Balanced performance and features
  BALANCED: {
    enableWorkers: true,
    enableCaching: true,
    enableLearning: true,
    performanceMode: 'balanced'
  },
  
  // Maximum accuracy with all features
  ACCURACY: {
    enableWorkers: false,
    enableCaching: true,
    enableLearning: true,
    performanceMode: 'memory'
  },
  
  // Memory-constrained environments
  LOW_MEMORY: {
    enableWorkers: false,
    enableCaching: false,
    enableLearning: false,
    performanceMode: 'memory'
  }
};