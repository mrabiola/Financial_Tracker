import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useFinancialData } from '../../hooks/useFinancialData';

const DataMigration = ({ localData, onClose, onComplete }) => {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const { addAccount: addAccountToDb, updateSnapshot, addGoal: addGoalToDb } = useFinancialData(currentYear);

  const migrateData = async () => {
    setMigrating(true);
    setError('');
    setProgress(0);

    try {
      const yearData = localData.years[currentYear];
      if (!yearData) {
        setError('No data found for current year');
        return;
      }

      const totalItems = 
        (yearData.assets?.length || 0) + 
        (yearData.liabilities?.length || 0) + 
        (yearData.goals?.length || 0);
      
      let processed = 0;
      const accountMap = new Map();

      // Migrate assets
      for (const asset of (yearData.assets || [])) {
        const newAccount = await addAccountToDb(asset.name, 'asset');
        if (newAccount) {
          accountMap.set(asset.id, newAccount.id);
          
          // Migrate monthly values
          for (let month = 0; month < 12; month++) {
            const key = `${asset.id}_${month}`;
            const value = yearData.monthlyData?.[key] || 0;
            if (value > 0) {
              await updateSnapshot(newAccount.id, month, value);
            }
          }
        }
        processed++;
        setProgress((processed / totalItems) * 100);
      }

      // Migrate liabilities
      for (const liability of (yearData.liabilities || [])) {
        const newAccount = await addAccountToDb(liability.name, 'liability');
        if (newAccount) {
          accountMap.set(liability.id, newAccount.id);
          
          // Migrate monthly values
          for (let month = 0; month < 12; month++) {
            const key = `${liability.id}_${month}`;
            const value = yearData.monthlyData?.[key] || 0;
            if (value > 0) {
              await updateSnapshot(newAccount.id, month, value);
            }
          }
        }
        processed++;
        setProgress((processed / totalItems) * 100);
      }

      // Migrate goals
      for (const goal of (yearData.goals || [])) {
        await addGoalToDb(goal.name, goal.target);
        processed++;
        setProgress((processed / totalItems) * 100);
      }

      setSuccess(true);
      localStorage.setItem('dataMigrated', 'true');
      
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (err) {
      console.error('Migration error:', err);
      setError('Failed to migrate data. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Import Local Data</h3>
            <p className="text-sm text-gray-500 mt-1">
              We found existing data in your browser. Would you like to import it to the cloud?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Data migrated successfully!</span>
          </div>
        )}

        {migrating && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Migrating data...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={migrating}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
          <button
            onClick={migrateData}
            disabled={migrating || success}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {migrating ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataMigration;