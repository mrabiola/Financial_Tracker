import React, { useState, useRef } from 'react';
import { 
  X, Download, Upload, FileSpreadsheet, CheckCircle, 
  XCircle, Loader, Database
} from 'lucide-react';

const SimpleImportModal = ({ isOpen, onClose, onImport, selectedYear, accounts }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setIsProcessing(false);
    setDragActive(false);
    setImportResults(null);
    setError(null);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Generate template function
  const generateTemplate = async (format = 'xlsx') => {
    try {
      const XLSX = await import('xlsx');
      
      // Template data structure
      const templateData = [
        ['Account Name', 'Type', 'Amount', 'Month', 'Category', 'Notes'],
        ['Example Savings Account', 'Asset', '5000', 'Jan', 'Savings', 'Emergency fund'],
        ['Example Investment', 'Asset', '12500', 'Jan', 'Investments', '401k balance'],
        ['Example Credit Card', 'Liability', '2500', 'Jan', 'Credit Cards', 'Monthly balance'],
        ['Example Car Loan', 'Liability', '18000', 'Jan', 'Loans', 'Auto loan balance'],
        ['', '', '', '', '', ''],
        ['Instructions:', '', '', '', '', ''],
        ['1. Account Name: Required - Name of your account', '', '', '', '', ''],
        ['2. Type: Required - "Asset" or "Liability"', '', '', '', '', ''],
        ['3. Amount: Required - Numeric value (no $ signs)', '', '', '', '', ''],
        ['4. Month: Optional - Jan, Feb, Mar, etc. or 1-12', '', '', '', '', ''],
        ['5. Category: Optional - For grouping accounts', '', '', '', '', ''],
        ['6. Notes: Optional - Additional information', '', '', '', '', ''],
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(templateData);

      // Style the headers
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { horizontal: "center" }
      };

      // Apply styles to header row
      ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = headerStyle;
        }
      });

      // Set column widths
      ws['!cols'] = [
        { width: 25 }, // Account Name
        { width: 12 }, // Type
        { width: 12 }, // Amount
        { width: 10 }, // Month
        { width: 15 }, // Category
        { width: 30 }  // Notes
      ];

      // Add data validation for Type column (Excel only)
      if (format === 'xlsx') {
        ws['!dataValidation'] = {
          'B2:B1000': {
            type: 'list',
            allowBlank: false,
            showInputMessage: true,
            showErrorMessage: true,
            inputTitle: 'Account Type',
            inputMessage: 'Please select Asset or Liability',
            errorTitle: 'Invalid Selection',
            errorMessage: 'Please select Asset or Liability',
            source: ['Asset', 'Liability']
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Net Worth Template');

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `NetWorth_Template_${date}.${format}`;

      // Download file
      if (format === 'xlsx') {
        XLSX.writeFile(wb, filename);
      } else {
        // Convert to CSV for CSV format
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating template:', error);
      setError('Failed to generate template. Please try again.');
    }
  };

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV file.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Parse and process the template file
  const processTemplateFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const XLSX = await import('xlsx');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let data;
          
          if (file.type === 'text/csv') {
            // Parse CSV
            const text = e.target.result;
            const lines = text.split('\n').map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
            data = lines;
          } else {
            // Parse Excel
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
          }

          // Filter out empty rows and instruction rows
          const filteredData = data.filter((row, index) => {
            if (index === 0) return true; // Keep header
            return row.some(cell => cell !== null && cell !== undefined && cell !== '') &&
                   !row[0]?.toString().toLowerCase().includes('instruction') &&
                   !row[0]?.toString().toLowerCase().includes('example');
          });

          if (filteredData.length <= 1) {
            throw new Error('No data found in the template. Please add your account information below the header row.');
          }
          
          console.log('Template validation - Filtered data:', filteredData);
          console.log('Template validation - First row (headers):', filteredData[0]);

          // Validate template format
          const headers = filteredData[0].map(h => h?.toString().toLowerCase().trim());
          const requiredHeaders = [
            { name: 'account name', variations: ['account name', 'accountname', 'name'] },
            { name: 'type', variations: ['type', 'account type', 'accounttype'] },
            { name: 'amount', variations: ['amount', 'value', 'balance'] }
          ];
          
          const missingHeaders = requiredHeaders.filter(req => 
            !headers.some(h => req.variations.some(variation => h.includes(variation)))
          ).map(req => req.name);

          if (missingHeaders.length > 0) {
            const expectedHeaders = "'Account Name', 'Type', 'Amount'";
            const foundHeaders = headers.map(h => `'${h}'`).join(', ');
            throw new Error(
              `Missing required columns: ${missingHeaders.join(', ')}.\n\n` +
              `Expected headers: ${expectedHeaders}\n` +
              `Found headers: ${foundHeaders}\n\n` +
              "Please use the provided template format and ensure column names match exactly."
            );
          }

          // Find column indices with more flexible matching
          const findColumnIndex = (variations) => {
            for (const variation of variations) {
              const index = headers.findIndex(h => h.includes(variation));
              if (index !== -1) {
                console.log(`Found column '${variation}' at index ${index}`);
                return index;
              }
            }
            console.log(`No column found for variations: ${variations}`);
            return -1;
          };
          
          const accountIndex = findColumnIndex(['account name', 'accountname', 'name']);
          const typeIndex = findColumnIndex(['type', 'account type', 'accounttype']);
          const amountIndex = findColumnIndex(['amount', 'value', 'balance']);
          const monthIndex = findColumnIndex(['month']);
          const categoryIndex = findColumnIndex(['category']);
          const notesIndex = findColumnIndex(['notes', 'note', 'description']);
          
          console.log('Column indices:', { accountIndex, typeIndex, amountIndex, monthIndex, categoryIndex, notesIndex });
          
          // Verify we found the required columns
          if (accountIndex === -1) {
            throw new Error(`Could not find 'Account Name' column. Please ensure your template has a column named 'Account Name'.`);
          }
          if (typeIndex === -1) {
            throw new Error(`Could not find 'Type' column. Please ensure your template has a column named 'Type'.`);
          }
          if (amountIndex === -1) {
            throw new Error(`Could not find 'Amount' column. Please ensure your template has a column named 'Amount'.`);
          }

          // Process data rows
          const processedData = [];
          const validationErrors = [];
          
          for (let i = 1; i < filteredData.length; i++) {
            const row = filteredData[i];
            
            // Skip empty rows
            if (!row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
              continue;
            }

            const accountName = row[accountIndex]?.toString().trim();
            const type = row[typeIndex]?.toString().trim().toLowerCase();
            const amountStr = row[amountIndex]?.toString().trim();
            const month = row[monthIndex]?.toString().trim();
            const category = row[categoryIndex]?.toString().trim();
            const notes = row[notesIndex]?.toString().trim();

            // Validate required fields
            if (!accountName) {
              validationErrors.push(`Row ${i + 1}: Account Name is required`);
              continue;
            }
            
            if (!type || !['asset', 'liability'].includes(type)) {
              validationErrors.push(`Row ${i + 1}: Type must be "Asset" or "Liability"`);
              continue;
            }
            
            if (!amountStr || isNaN(parseFloat(amountStr))) {
              validationErrors.push(`Row ${i + 1}: Amount must be a valid number`);
              continue;
            }

            const amount = parseFloat(amountStr);
            
            // Validate month if provided
            let monthNum = null;
            if (month) {
              if (['jan', 'january'].includes(month.toLowerCase())) monthNum = 1;
              else if (['feb', 'february'].includes(month.toLowerCase())) monthNum = 2;
              else if (['mar', 'march'].includes(month.toLowerCase())) monthNum = 3;
              else if (['apr', 'april'].includes(month.toLowerCase())) monthNum = 4;
              else if (['may'].includes(month.toLowerCase())) monthNum = 5;
              else if (['jun', 'june'].includes(month.toLowerCase())) monthNum = 6;
              else if (['jul', 'july'].includes(month.toLowerCase())) monthNum = 7;
              else if (['aug', 'august'].includes(month.toLowerCase())) monthNum = 8;
              else if (['sep', 'september'].includes(month.toLowerCase())) monthNum = 9;
              else if (['oct', 'october'].includes(month.toLowerCase())) monthNum = 10;
              else if (['nov', 'november'].includes(month.toLowerCase())) monthNum = 11;
              else if (['dec', 'december'].includes(month.toLowerCase())) monthNum = 12;
              else if (!isNaN(parseInt(month)) && parseInt(month) >= 1 && parseInt(month) <= 12) {
                monthNum = parseInt(month);
              }
            }

            processedData.push({
              name: accountName,
              type: type,
              amount: amount,
              month: monthNum,
              category: category || '',
              notes: notes || ''
            });
          }

          if (validationErrors.length > 0) {
            throw new Error(`Validation errors:\n${validationErrors.join('\n')}`);
          }

          if (processedData.length === 0) {
            throw new Error('No valid data rows found. Please check your template format.');
          }

          // Import the data by calling onImport for each account
          let successCount = 0;
          const importErrors = [];

          for (const item of processedData) {
            try {
              await onImport({
                accountName: item.name,
                accountType: item.type, // Use singular form directly: 'asset' or 'liability'
                monthIndex: item.month ? item.month - 1 : 0, // Convert to 0-based index, default to January
                value: item.amount,
                year: selectedYear,
                category: item.category,
                notes: item.notes
              });
              successCount++;
            } catch (error) {
              console.error(`Error importing ${item.name}:`, error);
              importErrors.push(`Failed to import ${item.name}: ${error.message}`);
            }
          }

          if (importErrors.length > 0 && successCount === 0) {
            throw new Error(`All imports failed:\n${importErrors.join('\n')}`);
          } else if (importErrors.length > 0) {
            console.warn('Some imports failed:', importErrors);
          }

          const importData = {
            assets: processedData.filter(item => item.type === 'asset'),
            liabilities: processedData.filter(item => item.type === 'liability')
          };

          // Show success results
          setImportResults({
            success: true,
            assetsAdded: importData.assets.length,
            liabilitiesAdded: importData.liabilities.length,
            totalAdded: processedData.length
          });

        } catch (error) {
          console.error('Error processing file:', error);
          setError(error.message || 'Failed to process the file. Please check the format and try again.');
        } finally {
          setIsProcessing(false);
        }
      };

      if (file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
      
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Failed to read the file. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Simple Import</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!importResults ? (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">How to use Simple Import:</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Download the template file below</li>
                    <li>Fill in your account information (replace example data)</li>
                    <li>Upload the completed template</li>
                    <li>Review and confirm the import</li>
                  </ol>
                </div>
              </div>

              {/* Template Download */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Step 1: Download Template</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => generateTemplate('xlsx')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Excel Template (.xlsx)
                  </button>
                  <button
                    onClick={() => generateTemplate('csv')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    CSV Template (.csv)
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Step 2: Upload Completed Template</h4>
                
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : file 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drag & drop your template file here
                      </p>
                      <p className="text-gray-600 mb-4">or</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {file && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Import Error</h4>
                      <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processTemplateFile}
                  disabled={!file || isProcessing}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Import Data
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success Results */
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Import Successful!</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.assetsAdded}
                    </div>
                    <div className="text-sm text-gray-600">Assets Added</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.liabilitiesAdded}
                    </div>
                    <div className="text-sm text-gray-600">Liabilities Added</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.totalAdded}
                    </div>
                    <div className="text-sm text-gray-600">Total Accounts</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setImportResults(null);
                    resetState();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Import More
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleImportModal;