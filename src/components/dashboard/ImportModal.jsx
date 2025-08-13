import React, { useState, useEffect } from 'react';
import { X, Upload, ChevronRight, ChevronLeft, Check, AlertCircle, FileSpreadsheet, FileText, Table, DollarSign, Calendar, Type, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const ImportModal = ({ isOpen, onClose, onImport, selectedYear, accounts }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [preview, setPreview] = useState([]);
  const [importConfig, setImportConfig] = useState({
    dataStructure: 'single', // 'single' or 'monthly'
    accountNameColumn: null,
    amountColumn: null,
    typeColumn: null,
    dateColumn: null,
    monthColumns: {},
    skipRows: 0,
    hasHeaders: true
  });
  const [validationResults, setValidationResults] = useState({
    valid: [],
    invalid: [],
    warnings: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep(1);
      setFile(null);
      setFileType('');
      setRawData([]);
      setHeaders([]);
      setPreview([]);
      setImportConfig({
        dataStructure: 'single',
        accountNameColumn: null,
        amountColumn: null,
        typeColumn: null,
        dateColumn: null,
        monthColumns: {},
        skipRows: 0,
        hasHeaders: true
      });
      setValidationResults({ valid: [], invalid: [], warnings: [] });
      setIsProcessing(false);
      setImportProgress(0);
      setImportResults(null);
    }
  }, [isOpen]);

  // File handling
  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    setFileType(extension);

    try {
      if (extension === 'xlsx' || extension === 'xls') {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = (e) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
          processData(jsonData);
        };
        reader.readAsBinaryString(selectedFile);
      } else if (extension === 'csv' || extension === 'txt') {
        // Handle CSV/Text files
        Papa.parse(selectedFile, {
          complete: (result) => {
            processData(result.data);
          },
          error: (error) => {
            console.error('Error parsing file:', error);
            alert('Error parsing file. Please check the format.');
            setIsProcessing(false);
          }
        });
      } else {
        alert('Unsupported file type. Please upload Excel (.xlsx, .xls), CSV, or text files.');
        setFile(null);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      setIsProcessing(false);
    }
  };

  const processData = (data) => {
    // Remove empty rows
    const filteredData = data.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    
    if (filteredData.length === 0) {
      alert('The file appears to be empty.');
      setIsProcessing(false);
      return;
    }

    setRawData(filteredData);
    
    // Auto-detect headers
    const potentialHeaders = filteredData[0];
    setHeaders(potentialHeaders);
    
    // Set preview (first 10 rows)
    setPreview(filteredData.slice(0, Math.min(10, filteredData.length)));
    
    // Auto-detect column mappings
    autoDetectColumns(potentialHeaders);
    
    setIsProcessing(false);
    setStep(2);
  };

  const autoDetectColumns = (headers) => {
    const newConfig = { ...importConfig };
    const monthlyColumns = {};
    
    headers.forEach((header, index) => {
      const headerLower = String(header).toLowerCase();
      
      // Detect account name column
      if (headerLower.includes('account') || headerLower.includes('name') || headerLower.includes('description')) {
        newConfig.accountNameColumn = index;
      }
      
      // Detect amount column
      if (headerLower.includes('amount') || headerLower.includes('value') || headerLower.includes('balance')) {
        newConfig.amountColumn = index;
      }
      
      // Detect type column
      if (headerLower.includes('type') || headerLower.includes('category')) {
        newConfig.typeColumn = index;
      }
      
      // Detect date column
      if (headerLower.includes('date') || headerLower.includes('month') || headerLower.includes('period')) {
        newConfig.dateColumn = index;
      }
      
      // Detect monthly columns
      months.forEach((month) => {
        if (headerLower.includes(month.toLowerCase()) || 
            headerLower === month.toLowerCase() ||
            headerLower.includes(month.slice(0, 3).toLowerCase())) {
          const monthIndex = months.indexOf(month);
          monthlyColumns[monthIndex] = index;
        }
      });
    });
    
    // Determine data structure
    if (Object.keys(monthlyColumns).length >= 3) {
      newConfig.dataStructure = 'monthly';
      newConfig.monthColumns = monthlyColumns;
    } else {
      newConfig.dataStructure = 'single';
    }
    
    setImportConfig(newConfig);
  };

  const validateData = () => {
    const valid = [];
    const invalid = [];
    const warnings = [];
    
    const startRow = importConfig.hasHeaders ? 1 : 0;
    const dataRows = rawData.slice(startRow + importConfig.skipRows);
    
    dataRows.forEach((row, rowIndex) => {
      const actualRowNumber = rowIndex + startRow + importConfig.skipRows + 1;
      
      if (importConfig.dataStructure === 'single') {
        // Validate single-value structure
        const accountName = row[importConfig.accountNameColumn];
        const amount = row[importConfig.amountColumn];
        const type = row[importConfig.typeColumn];
        
        if (!accountName || accountName.trim() === '') {
          invalid.push({
            row: actualRowNumber,
            issue: 'Missing account name',
            data: row
          });
          return;
        }
        
        const parsedAmount = parseFloat(String(amount).replace(/[^0-9.-]/g, ''));
        if (isNaN(parsedAmount)) {
          invalid.push({
            row: actualRowNumber,
            issue: 'Invalid amount value',
            data: row
          });
          return;
        }
        
        // Detect account type if not specified
        let accountType = type ? String(type).toLowerCase() : null;
        if (!accountType) {
          accountType = detectAccountType(accountName);
        }
        
        valid.push({
          accountName,
          amount: parsedAmount,
          type: accountType,
          row: actualRowNumber
        });
        
      } else if (importConfig.dataStructure === 'monthly') {
        // Validate monthly structure
        const accountName = row[importConfig.accountNameColumn];
        
        if (!accountName || accountName.trim() === '') {
          invalid.push({
            row: actualRowNumber,
            issue: 'Missing account name',
            data: row
          });
          return;
        }
        
        const monthlyData = {};
        let hasValidData = false;
        
        Object.entries(importConfig.monthColumns).forEach(([monthIndex, colIndex]) => {
          const value = row[colIndex];
          if (value !== null && value !== undefined && value !== '') {
            const parsedValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
            if (!isNaN(parsedValue)) {
              monthlyData[monthIndex] = parsedValue;
              hasValidData = true;
            }
          }
        });
        
        if (!hasValidData) {
          warnings.push({
            row: actualRowNumber,
            issue: 'No valid monthly data found',
            data: row
          });
          return;
        }
        
        const accountType = detectAccountType(accountName);
        
        valid.push({
          accountName,
          monthlyData,
          type: accountType,
          row: actualRowNumber
        });
      }
    });
    
    setValidationResults({ valid, invalid, warnings });
    setStep(3);
  };

  const detectAccountType = (accountName) => {
    const nameLower = accountName.toLowerCase();
    
    // Liability indicators
    if (nameLower.includes('loan') || 
        nameLower.includes('credit') || 
        nameLower.includes('card') ||
        nameLower.includes('mortgage') ||
        nameLower.includes('debt') ||
        nameLower.includes('owe') ||
        nameLower.includes('payable')) {
      return 'liability';
    }
    
    // Asset indicators
    if (nameLower.includes('saving') ||
        nameLower.includes('checking') ||
        nameLower.includes('401k') ||
        nameLower.includes('ira') ||
        nameLower.includes('investment') ||
        nameLower.includes('stock') ||
        nameLower.includes('bond') ||
        nameLower.includes('cash') ||
        nameLower.includes('property') ||
        nameLower.includes('house') ||
        nameLower.includes('car') ||
        nameLower.includes('asset')) {
      return 'asset';
    }
    
    // Default to asset if unclear
    return 'asset';
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setImportProgress(0);
    
    const results = {
      imported: [],
      skipped: [],
      errors: [],
      created: {
        assets: [],
        liabilities: []
      }
    };
    
    const totalItems = validationResults.valid.length;
    
    for (let i = 0; i < validationResults.valid.length; i++) {
      const item = validationResults.valid[i];
      setImportProgress(Math.round(((i + 1) / totalItems) * 100));
      
      try {
        // Check if account exists
        let existingAccount = [...accounts.assets, ...accounts.liabilities].find(
          a => a.name.toLowerCase() === item.accountName.toLowerCase()
        );
        
        // Create account if it doesn't exist
        if (!existingAccount) {
          const newAccountData = {
            id: Date.now() + Math.random(),
            name: item.accountName,
            type: item.type
          };
          
          results.created[item.type === 'liability' ? 'liabilities' : 'assets'].push(newAccountData);
          existingAccount = newAccountData;
        }
        
        // Import data based on structure
        if (importConfig.dataStructure === 'monthly' && item.monthlyData) {
          // Import monthly data
          Object.entries(item.monthlyData).forEach(([monthIndex, value]) => {
            onImport({
              accountId: existingAccount.id,
              accountName: existingAccount.name,
              accountType: existingAccount.type || item.type,
              monthIndex: parseInt(monthIndex),
              value: value,
              year: selectedYear
            });
          });
          
          results.imported.push({
            account: item.accountName,
            type: 'monthly',
            months: Object.keys(item.monthlyData).length
          });
        } else {
          // Import single value to current month
          const monthIndex = importConfig.dateColumn ? 
            extractMonthFromDate(item.date) : 
            new Date().getMonth();
            
          onImport({
            accountId: existingAccount.id,
            accountName: existingAccount.name,
            accountType: existingAccount.type || item.type,
            monthIndex: monthIndex,
            value: item.amount,
            year: selectedYear
          });
          
          results.imported.push({
            account: item.accountName,
            type: 'single',
            month: months[monthIndex]
          });
        }
      } catch (error) {
        results.errors.push({
          account: item.accountName,
          error: error.message
        });
      }
    }
    
    // Add invalid items to results
    validationResults.invalid.forEach(item => {
      results.skipped.push({
        row: item.row,
        reason: item.issue
      });
    });
    
    setImportResults(results);
    setIsProcessing(false);
    setStep(4);
  };

  const extractMonthFromDate = (dateStr) => {
    if (!dateStr) return new Date().getMonth();
    
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.getMonth();
    }
    
    // Try to find month name in string
    for (let i = 0; i < months.length; i++) {
      if (dateStr.toLowerCase().includes(months[i].toLowerCase())) {
        return i;
      }
    }
    
    return new Date().getMonth();
  };

  const getStepIcon = (stepNumber) => {
    if (step > stepNumber) return <Check className="w-5 h-5" />;
    if (step === stepNumber) {
      switch (stepNumber) {
        case 1: return <Upload className="w-5 h-5" />;
        case 2: return <Table className="w-5 h-5" />;
        case 3: return <CheckCircle className="w-5 h-5" />;
        case 4: return <Check className="w-5 h-5" />;
        default: return null;
      }
    }
    return <span className="text-sm">{stepNumber}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Import Financial Data</h2>
              <p className="text-sm text-gray-500">Import from Excel, CSV, or text files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= stepNum ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step >= stepNum ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                  }`}>
                    {getStepIcon(stepNum)}
                  </div>
                  <span className="text-sm font-medium">
                    {stepNum === 1 && 'Upload'}
                    {stepNum === 2 && 'Configure'}
                    {stepNum === 3 && 'Validate'}
                    {stepNum === 4 && 'Complete'}
                  </span>
                </div>
                {stepNum < 4 && (
                  <ChevronRight className={`w-5 h-5 mx-2 ${step > stepNum ? 'text-blue-600' : 'text-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Choose a file to import</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supports Excel (.xlsx, .xls), CSV, and text files
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Select File
                </label>
                {file && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-blue-800">
                      {fileType === 'xlsx' || fileType === 'xls' ? (
                        <FileSpreadsheet className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      {file.name}
                    </div>
                  </div>
                )}
              </div>

              {/* File Format Guide */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Supported File Formats
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>Single Value Format:</strong> Account Name | Amount | Type (Asset/Liability)
                  </div>
                  <div>
                    <strong>Monthly Columns Format:</strong> Account Name | Jan | Feb | Mar | ... | Dec
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Configure Import Settings</h3>
                
                {/* Data Structure Selection */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Data Structure</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setImportConfig({...importConfig, dataStructure: 'single'})}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        importConfig.dataStructure === 'single' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <div className="font-medium">Single Values</div>
                      <div className="text-xs text-gray-500">One amount per row</div>
                    </button>
                    <button
                      onClick={() => setImportConfig({...importConfig, dataStructure: 'monthly'})}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        importConfig.dataStructure === 'monthly' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <div className="font-medium">Monthly Columns</div>
                      <div className="text-xs text-gray-500">Jan, Feb, Mar... columns</div>
                    </button>
                  </div>
                </div>

                {/* Column Mapping */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Column Mapping</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Account Name Column */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Account Name Column</label>
                      <select
                        value={importConfig.accountNameColumn ?? ''}
                        onChange={(e) => setImportConfig({...importConfig, accountNameColumn: e.target.value ? parseInt(e.target.value) : null})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select column...</option>
                        {headers.map((header, index) => (
                          <option key={index} value={index}>
                            Column {index + 1}: {header}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Conditional columns based on structure */}
                    {importConfig.dataStructure === 'single' ? (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Amount Column</label>
                          <select
                            value={importConfig.amountColumn ?? ''}
                            onChange={(e) => setImportConfig({...importConfig, amountColumn: e.target.value ? parseInt(e.target.value) : null})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Select column...</option>
                            {headers.map((header, index) => (
                              <option key={index} value={index}>
                                Column {index + 1}: {header}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Type Column (Optional)</label>
                          <select
                            value={importConfig.typeColumn ?? ''}
                            onChange={(e) => setImportConfig({...importConfig, typeColumn: e.target.value ? parseInt(e.target.value) : null})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Auto-detect</option>
                            {headers.map((header, index) => (
                              <option key={index} value={index}>
                                Column {index + 1}: {header}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date Column (Optional)</label>
                          <select
                            value={importConfig.dateColumn ?? ''}
                            onChange={(e) => setImportConfig({...importConfig, dateColumn: e.target.value ? parseInt(e.target.value) : null})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Current month</option>
                            {headers.map((header, index) => (
                              <option key={index} value={index}>
                                Column {index + 1}: {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Monthly Columns Detected</label>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          {Object.keys(importConfig.monthColumns).length > 0 ? (
                            <span className="text-blue-800">
                              {Object.keys(importConfig.monthColumns).length} month columns found
                            </span>
                          ) : (
                            <span className="text-orange-600">No month columns detected</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Skip Rows</label>
                    <input
                      type="number"
                      min="0"
                      value={importConfig.skipRows}
                      onChange={(e) => setImportConfig({...importConfig, skipRows: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mt-5">
                      <input
                        type="checkbox"
                        checked={importConfig.hasHeaders}
                        onChange={(e) => setImportConfig({...importConfig, hasHeaders: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">First row contains headers</span>
                    </label>
                  </div>
                </div>

                {/* Data Preview */}
                <div>
                  <h4 className="font-medium mb-2">Data Preview</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left border-b">
                              <div className="flex items-center gap-1">
                                <span>{header}</span>
                                {index === importConfig.accountNameColumn && (
                                  <Type className="w-3 h-3 text-blue-600" />
                                )}
                                {index === importConfig.amountColumn && (
                                  <DollarSign className="w-3 h-3 text-green-600" />
                                )}
                                {Object.values(importConfig.monthColumns).includes(index) && (
                                  <Calendar className="w-3 h-3 text-purple-600" />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(importConfig.hasHeaders ? 1 : 0).slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 border-b">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validate */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Validation</h3>
              
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Valid Records</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.valid.length}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Invalid Records</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {validationResults.invalid.length}
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Warnings</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationResults.warnings.length}
                  </div>
                </div>
              </div>

              {/* Valid Records Preview */}
              {validationResults.valid.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2 text-green-800">Valid Records (Preview)</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Account</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          {importConfig.dataStructure === 'single' ? (
                            <th className="px-3 py-2 text-right">Amount</th>
                          ) : (
                            <th className="px-3 py-2 text-left">Monthly Data</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.valid.slice(0, 5).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 border-b">
                            <td className="px-3 py-2">{item.accountName}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.type === 'asset' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            {importConfig.dataStructure === 'single' ? (
                              <td className="px-3 py-2 text-right font-mono">
                                ${item.amount.toFixed(2)}
                              </td>
                            ) : (
                              <td className="px-3 py-2 text-xs">
                                {Object.keys(item.monthlyData).length} months
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validationResults.valid.length > 5 && (
                      <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600">
                        And {validationResults.valid.length - 5} more records...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invalid Records */}
              {validationResults.invalid.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2 text-red-800">Invalid Records</h4>
                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Issue</th>
                          <th className="px-3 py-2 text-left">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.invalid.slice(0, 5).map((item, index) => (
                          <tr key={index} className="hover:bg-red-50 border-b">
                            <td className="px-3 py-2">{item.row}</td>
                            <td className="px-3 py-2 text-red-600">{item.issue}</td>
                            <td className="px-3 py-2 text-xs text-gray-500">
                              {item.data.slice(0, 3).join(', ')}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validationResults.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-yellow-800">Warnings</h4>
                  <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                    <ul className="space-y-1 text-sm text-yellow-800">
                      {validationResults.warnings.slice(0, 5).map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Row {warning.row}: {warning.issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && importResults && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete!</h3>
                <p className="text-gray-600">Your financial data has been successfully imported.</p>
              </div>

              {/* Import Summary */}
              <div className="space-y-4">
                {/* Imported Records */}
                {importResults.imported.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">
                      Successfully Imported: {importResults.imported.length} records
                    </h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      {importResults.imported.slice(0, 5).map((item, index) => (
                        <li key={index}>
                          ✓ {item.account} - {item.type === 'monthly' 
                            ? `${item.months} months` 
                            : `${item.month}`}
                        </li>
                      ))}
                      {importResults.imported.length > 5 && (
                        <li className="text-green-600">
                          And {importResults.imported.length - 5} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Created Accounts */}
                {(importResults.created.assets.length > 0 || importResults.created.liabilities.length > 0) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">New Accounts Created</h4>
                    <div className="space-y-2 text-sm">
                      {importResults.created.assets.length > 0 && (
                        <div>
                          <span className="text-blue-700 font-medium">Assets:</span>
                          <ul className="ml-4 text-blue-600">
                            {importResults.created.assets.map((account, index) => (
                              <li key={index}>• {account.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {importResults.created.liabilities.length > 0 && (
                        <div>
                          <span className="text-blue-700 font-medium">Liabilities:</span>
                          <ul className="ml-4 text-blue-600">
                            {importResults.created.liabilities.map((account, index) => (
                              <li key={index}>• {account.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skipped Records */}
                {importResults.skipped.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">
                      Skipped: {importResults.skipped.length} records
                    </h4>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {importResults.skipped.slice(0, 3).map((item, index) => (
                        <li key={index}>Row {item.row}: {item.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Errors */}
                {importResults.errors.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">
                      Errors: {importResults.errors.length}
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      {importResults.errors.slice(0, 3).map((item, index) => (
                        <li key={index}>{item.account}: {item.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step === 3 && (
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {step < 4 && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            
            {step === 2 && (
              <button
                onClick={validateData}
                disabled={!importConfig.accountNameColumn || (importConfig.dataStructure === 'single' && !importConfig.amountColumn)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Validate Data
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            {step === 3 && (
              <button
                onClick={handleImport}
                disabled={validationResults.valid.length === 0 || isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing... {importProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {validationResults.valid.length} Records
                  </>
                )}
              </button>
            )}
            
            {step === 4 && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;