import * as XLSX from 'xlsx';

export class ExcelParser {
  constructor() {
    this.workbook = null;
    this.rawData = null;
    this.metadata = null;
  }

  async parseFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { 
            type: 'binary',
            cellFormula: true,
            cellStyles: true,
            cellDates: true,
            raw: false
          });
          
          this.workbook = workbook;
          this.rawData = this.extractRawData(workbook);
          this.metadata = this.extractMetadata(file, workbook);
          
          resolve({
            rawData: this.rawData,
            metadata: this.metadata,
            success: true
          });
        } catch (error) {
          reject({
            error: error.message,
            success: false
          });
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }

  extractRawData(workbook) {
    const sheets = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = {
        name: sheetName,
        cells: new Map(),
        formulas: [],
        mergedRegions: worksheet['!merges'] || [],
        range: worksheet['!ref'],
        data: [],
        rawCells: {}
      };
      
      // Extract all cells with complete information
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        const rowData = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          
          if (cell) {
            const cellData = {
              position: cellAddress,
              row: row,
              col: col,
              value: cell.v,
              type: cell.t, // b: boolean, n: number, e: error, s: string, d: date
              formula: cell.f,
              format: cell.z,
              style: cell.s,
              raw: cell.w,
              hyperlink: cell.l
            };
            
            sheetData.cells.set(cellAddress, cellData);
            sheetData.rawCells[cellAddress] = cell;
            
            if (cell.f) {
              sheetData.formulas.push({
                position: cellAddress,
                formula: cell.f,
                value: cell.v
              });
            }
            
            rowData.push(cell.v);
          } else {
            rowData.push(null);
          }
        }
        sheetData.data.push(rowData);
      }
      
      sheets.push(sheetData);
    });
    
    return { sheets };
  }

  extractMetadata(file, workbook) {
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: new Date(file.lastModified),
      sheetCount: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames,
      properties: workbook.Props || {},
      customProperties: workbook.Custprops || {},
      definedNames: workbook.Workbook?.Names || [],
      importDate: new Date()
    };
  }

  getCellValue(sheetIndex, cellAddress) {
    if (!this.rawData || !this.rawData.sheets[sheetIndex]) return null;
    return this.rawData.sheets[sheetIndex].cells.get(cellAddress);
  }

  getSheetData(sheetIndex) {
    if (!this.rawData || !this.rawData.sheets[sheetIndex]) return null;
    return this.rawData.sheets[sheetIndex];
  }

  getAllSheets() {
    return this.rawData?.sheets || [];
  }

  getFormulas(sheetIndex) {
    if (!this.rawData || !this.rawData.sheets[sheetIndex]) return [];
    return this.rawData.sheets[sheetIndex].formulas;
  }

  getMergedRegions(sheetIndex) {
    if (!this.rawData || !this.rawData.sheets[sheetIndex]) return [];
    return this.rawData.sheets[sheetIndex].mergedRegions;
  }
}

export default ExcelParser;