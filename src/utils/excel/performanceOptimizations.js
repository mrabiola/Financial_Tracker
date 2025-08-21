export class PerformanceOptimizer {
  constructor() {
    this.workerPool = null;
    this.cacheManager = new CacheManager();
    this.memoryManager = new MemoryManager();
    this.progressCallbacks = new Set();
  }

  // Web Worker management for heavy processing
  initializeWorkerPool(size = navigator.hardwareConcurrency || 4) {
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not supported, falling back to main thread');
      return false;
    }

    this.workerPool = {
      workers: [],
      available: [],
      busy: new Set(),
      taskQueue: [],
      size: size
    };

    // Create worker script blob
    const workerScript = this.createWorkerScript();
    const workerBlob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);

    // Initialize workers
    for (let i = 0; i < size; i++) {
      try {
        const worker = new Worker(workerUrl);
        worker._id = i;
        worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
        worker.onerror = (e) => this.handleWorkerError(worker, e);
        
        this.workerPool.workers.push(worker);
        this.workerPool.available.push(worker);
      } catch (error) {
        console.warn(`Failed to create worker ${i}:`, error);
      }
    }

    URL.revokeObjectURL(workerUrl);
    return this.workerPool.workers.length > 0;
  }

  createWorkerScript() {
    return `
      // Excel processing worker
      self.onmessage = function(e) {
        const { taskId, type, data } = e.data;
        
        try {
          let result;
          
          switch (type) {
            case 'parseSheet':
              result = parseSheetData(data);
              break;
            case 'analyzePatterns':
              result = analyzePatterns(data);
              break;
            case 'classifyData':
              result = classifyData(data);
              break;
            case 'transformData':
              result = transformData(data);
              break;
            case 'validateData':
              result = validateData(data);
              break;
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({
            taskId: taskId,
            success: true,
            result: result
          });
        } catch (error) {
          self.postMessage({
            taskId: taskId,
            success: false,
            error: error.message
          });
        }
      };
      
      function parseSheetData(data) {
        // Lightweight sheet parsing
        const { rawData } = data;
        const processed = {
          cells: new Map(),
          rows: rawData.length,
          cols: rawData[0] ? rawData[0].length : 0
        };
        
        rawData.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (cell != null) {
              processed.cells.set(\`\${rowIndex},\${colIndex}\`, {
                value: cell,
                type: typeof cell,
                position: { row: rowIndex, col: colIndex }
              });
            }
          });
        });
        
        return processed;
      }
      
      function analyzePatterns(data) {
        // Pattern analysis logic
        const patterns = {
          temporal: [],
          numerical: [],
          textual: []
        };
        
        // Basic pattern detection
        data.cells.forEach((cell, position) => {
          if (typeof cell.value === 'number') {
            patterns.numerical.push(position);
          } else if (typeof cell.value === 'string') {
            patterns.textual.push(position);
            
            // Check for temporal patterns
            const temporal = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\\d{4}|q[1-4]/i;
            if (temporal.test(cell.value)) {
              patterns.temporal.push(position);
            }
          }
        });
        
        return patterns;
      }
      
      function classifyData(data) {
        // Data classification logic
        const classification = {
          accounts: [],
          values: [],
          temporal: [],
          confidence: 0
        };
        
        // Simple classification based on patterns
        const { patterns } = data;
        
        classification.confidence = Math.min(
          (patterns.numerical.length + patterns.textual.length) / 
          (patterns.numerical.length + patterns.textual.length + patterns.temporal.length), 
          1
        ) * 100;
        
        return classification;
      }
      
      function transformData(data) {
        // Data transformation logic
        const transformed = {
          accounts: [],
          transactions: [],
          metadata: {}
        };
        
        // Basic transformation
        const { rawData, mapping } = data;
        
        rawData.slice(1).forEach((row, index) => {
          if (mapping.accountColumn !== null && mapping.valueColumn !== null) {
            const account = row[mapping.accountColumn];
            const value = row[mapping.valueColumn];
            
            if (account && value != null) {
              transformed.transactions.push({
                id: 'tx_' + index,
                account: account,
                value: typeof value === 'number' ? value : parseFloat(value) || 0,
                row: index + 1
              });
            }
          }
        });
        
        return transformed;
      }
      
      function validateData(data) {
        // Data validation logic
        const validation = {
          valid: [],
          invalid: [],
          warnings: []
        };
        
        data.transactions.forEach((tx, index) => {
          if (tx.account && !isNaN(tx.value)) {
            validation.valid.push(tx);
          } else {
            validation.invalid.push({
              ...tx,
              error: !tx.account ? 'Missing account' : 'Invalid value'
            });
          }
        });
        
        return validation;
      }
    `;
  }

  async executeInWorker(type, data, options = {}) {
    if (!this.workerPool || this.workerPool.workers.length === 0) {
      // Fallback to main thread
      return this.executeInMainThread(type, data, options);
    }

    return new Promise((resolve, reject) => {
      const taskId = Date.now() + Math.random();
      const task = {
        taskId,
        type,
        data,
        options,
        resolve,
        reject,
        startTime: Date.now()
      };

      const worker = this.getAvailableWorker();
      if (worker) {
        this.assignTaskToWorker(worker, task);
      } else {
        this.workerPool.taskQueue.push(task);
      }
    });
  }

  getAvailableWorker() {
    return this.workerPool.available.shift() || null;
  }

  assignTaskToWorker(worker, task) {
    this.workerPool.busy.add(worker);
    worker._currentTask = task;
    
    worker.postMessage({
      taskId: task.taskId,
      type: task.type,
      data: task.data
    });
  }

  handleWorkerMessage(worker, event) {
    const { taskId, success, result, error } = event.data;
    const task = worker._currentTask;
    
    if (task && task.taskId === taskId) {
      // Mark worker as available
      this.workerPool.busy.delete(worker);
      this.workerPool.available.push(worker);
      worker._currentTask = null;
      
      // Resolve task
      if (success) {
        task.resolve(result);
      } else {
        task.reject(new Error(error));
      }
      
      // Process next task in queue
      if (this.workerPool.taskQueue.length > 0) {
        const nextTask = this.workerPool.taskQueue.shift();
        this.assignTaskToWorker(worker, nextTask);
      }
    }
  }

  handleWorkerError(worker, error) {
    console.error('Worker error:', error);
    
    if (worker._currentTask) {
      worker._currentTask.reject(new Error('Worker error: ' + error.message));
    }
    
    // Mark worker as available (might need recreation)
    this.workerPool.busy.delete(worker);
    this.workerPool.available.push(worker);
    worker._currentTask = null;
  }

  executeInMainThread(type, data, options) {
    // Fallback implementations for main thread
    switch (type) {
      case 'parseSheet':
        return this.parseSheetMainThread(data);
      case 'analyzePatterns':
        return this.analyzePatternsMainThread(data);
      case 'classifyData':
        return this.classifyDataMainThread(data);
      case 'transformData':
        return this.transformDataMainThread(data);
      case 'validateData':
        return this.validateDataMainThread(data);
      default:
        throw new Error('Unknown task type: ' + type);
    }
  }

  // Chunked processing for large datasets
  async processInChunks(data, processor, chunkSize = 1000, progressCallback = null) {
    const results = [];
    const totalChunks = Math.ceil(data.length / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.slice(start, end);
      
      try {
        const chunkResult = await processor(chunk, i, totalChunks);
        results.push(chunkResult);
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total: totalChunks,
            percentage: Math.round(((i + 1) / totalChunks) * 100)
          });
        }
        
        // Yield control to prevent blocking
        await this.yieldControl();
        
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        results.push({ error: error.message, chunk: i });
      }
    }
    
    return results;
  }

  async yieldControl() {
    return new Promise(resolve => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(resolve, { timeout: 50 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  // Memory management
  optimizeMemoryUsage(data) {
    // Convert large objects to more memory-efficient representations
    if (data.cells && data.cells instanceof Map) {
      // Compress cell data
      const compressed = new Map();
      data.cells.forEach((cell, position) => {
        compressed.set(position, {
          v: cell.value,
          t: this.getTypeCode(cell.type)
        });
      });
      data.cells = compressed;
    }

    // Remove unnecessary metadata
    if (data.metadata) {
      const essential = {
        fileName: data.metadata.fileName,
        fileSize: data.metadata.fileSize,
        sheetCount: data.metadata.sheetCount,
        importDate: data.metadata.importDate
      };
      data.metadata = essential;
    }

    return data;
  }

  getTypeCode(type) {
    const typeCodes = { 'string': 's', 'number': 'n', 'boolean': 'b', 'object': 'o' };
    return typeCodes[type] || 'u';
  }

  // Progressive loading
  async loadDataProgressively(file, progressCallback) {
    const chunks = [];
    const chunkSize = 1024 * 1024; // 1MB chunks
    let offset = 0;
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
      
      if (progressCallback) {
        progressCallback({
          phase: 'loading',
          loaded: offset,
          total: file.size,
          percentage: Math.round((offset / file.size) * 100)
        });
      }
      
      await this.yieldControl();
    }
    
    return chunks;
  }

  // Streaming parser for very large files
  async streamParse(file, options = {}) {
    const { chunkSize = 1024 * 1024, onProgress, onChunk } = options;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let offset = 0;
      let buffer = '';
      const results = [];
      
      const readNextChunk = () => {
        if (offset < file.size) {
          const chunk = file.slice(offset, offset + chunkSize);
          reader.readAsText(chunk);
        } else {
          // Process final buffer
          if (buffer.trim()) {
            const finalChunk = this.processTextChunk(buffer);
            if (finalChunk && onChunk) onChunk(finalChunk);
            results.push(finalChunk);
          }
          resolve(results);
        }
      };
      
      reader.onload = (e) => {
        buffer += e.target.result;
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        if (lines.length > 0) {
          const chunk = this.processTextChunk(lines.join('\n'));
          if (chunk && onChunk) onChunk(chunk);
          results.push(chunk);
        }
        
        offset += chunkSize;
        
        if (onProgress) {
          onProgress({
            loaded: Math.min(offset, file.size),
            total: file.size,
            percentage: Math.round((Math.min(offset, file.size) / file.size) * 100)
          });
        }
        
        setTimeout(readNextChunk, 0); // Yield control
      };
      
      reader.onerror = reject;
      readNextChunk();
    });
  }

  processTextChunk(text) {
    // Basic CSV parsing for text chunks
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => line.split(',').map(cell => cell.trim()));
  }

  // Caching system
  getCachedResult(key) {
    return this.cacheManager.get(key);
  }

  setCachedResult(key, result, ttl = 300000) { // 5 minutes default
    return this.cacheManager.set(key, result, ttl);
  }

  generateCacheKey(file, options) {
    const fileInfo = `${file.name}_${file.size}_${file.lastModified}`;
    const optionsInfo = JSON.stringify(options);
    return `excel_import_${this.hashString(fileInfo + optionsInfo)}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Cleanup and resource management
  cleanup() {
    // Terminate workers
    if (this.workerPool) {
      this.workerPool.workers.forEach(worker => {
        worker.terminate();
      });
      this.workerPool = null;
    }
    
    // Clear caches
    this.cacheManager.clear();
    
    // Clear progress callbacks
    this.progressCallbacks.clear();
  }

  // Performance monitoring
  measurePerformance(fn, label) {
    return async (...args) => {
      const start = performance.now();
      let result;
      
      try {
        result = await fn(...args);
        const end = performance.now();
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
      } catch (error) {
        const end = performance.now();
        console.error(`${label} failed after ${(end - start).toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }

  // Main thread fallbacks
  parseSheetMainThread(data) {
    const { rawData } = data;
    const processed = {
      cells: new Map(),
      rows: rawData.length,
      cols: rawData[0] ? rawData[0].length : 0
    };
    
    rawData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell != null) {
          processed.cells.set(`${rowIndex},${colIndex}`, {
            value: cell,
            type: typeof cell,
            position: { row: rowIndex, col: colIndex }
          });
        }
      });
    });
    
    return processed;
  }

  analyzePatternsMainThread(data) {
    const patterns = {
      temporal: [],
      numerical: [],
      textual: []
    };
    
    data.cells.forEach((cell, position) => {
      if (typeof cell.value === 'number') {
        patterns.numerical.push(position);
      } else if (typeof cell.value === 'string') {
        patterns.textual.push(position);
        
        const temporal = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|q[1-4]/i;
        if (temporal.test(cell.value)) {
          patterns.temporal.push(position);
        }
      }
    });
    
    return patterns;
  }

  classifyDataMainThread(data) {
    const classification = {
      accounts: [],
      values: [],
      temporal: [],
      confidence: 0
    };
    
    const { patterns } = data;
    
    classification.confidence = Math.min(
      (patterns.numerical.length + patterns.textual.length) / 
      (patterns.numerical.length + patterns.textual.length + patterns.temporal.length), 
      1
    ) * 100;
    
    return classification;
  }

  transformDataMainThread(data) {
    const transformed = {
      accounts: [],
      transactions: [],
      metadata: {}
    };
    
    const { rawData, mapping } = data;
    
    rawData.slice(1).forEach((row, index) => {
      if (mapping.accountColumn !== null && mapping.valueColumn !== null) {
        const account = row[mapping.accountColumn];
        const value = row[mapping.valueColumn];
        
        if (account && value != null) {
          transformed.transactions.push({
            id: 'tx_' + index,
            account: account,
            value: typeof value === 'number' ? value : parseFloat(value) || 0,
            row: index + 1
          });
        }
      }
    });
    
    return transformed;
  }

  validateDataMainThread(data) {
    const validation = {
      valid: [],
      invalid: [],
      warnings: []
    };
    
    data.transactions.forEach((tx) => {
      if (tx.account && !isNaN(tx.value)) {
        validation.valid.push(tx);
      } else {
        validation.invalid.push({
          ...tx,
          error: !tx.account ? 'Missing account' : 'Invalid value'
        });
      }
    });
    
    return validation;
  }
}

// Cache Manager
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const ttl = this.ttls.get(key);
      if (!ttl || ttl > Date.now()) {
        return this.cache.get(key);
      } else {
        this.delete(key);
      }
    }
    return null;
  }

  set(key, value, ttl) {
    this.cache.set(key, value);
    if (ttl) {
      this.ttls.set(key, Date.now() + ttl);
    }
  }

  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Memory Manager
class MemoryManager {
  constructor() {
    this.memoryUsage = new Map();
    this.maxMemory = this.getAvailableMemory();
  }

  getAvailableMemory() {
    // Estimate available memory (conservative)
    if (navigator.deviceMemory) {
      return navigator.deviceMemory * 1024 * 1024 * 1024 * 0.5; // Use 50% of device memory
    }
    return 1024 * 1024 * 1024; // Default to 1GB
  }

  trackMemoryUsage(key, size) {
    this.memoryUsage.set(key, size);
  }

  releaseMemory(key) {
    this.memoryUsage.delete(key);
  }

  getCurrentUsage() {
    let total = 0;
    this.memoryUsage.forEach(size => total += size);
    return total;
  }

  isMemoryAvailable(requiredSize) {
    return this.getCurrentUsage() + requiredSize <= this.maxMemory;
  }

  forceGarbageCollection() {
    // Trigger garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
}

export default PerformanceOptimizer;