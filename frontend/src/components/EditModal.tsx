import React, { useState, useEffect } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType: 'duration' | 'outcome';
  currentData: any[];
  existingData: any;
  onSave: (data: any[]) => void;
  onOverwriteConfirm: () => void;
}

function EditModal({ 
  isOpen, 
  onClose, 
  chartType, 
  currentData, 
  existingData,
  onSave,
  onOverwriteConfirm 
}: EditModalProps) {
  const [editedData, setEditedData] = useState(currentData);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);

  useEffect(() => {
    setEditedData(currentData);
    if (existingData && existingData.chart_data) {
      setShowOverwriteWarning(true);
    }
  }, [currentData, existingData]);

  if (!isOpen) return null;

  const handleConfirmOverwrite = () => {
    setShowOverwriteWarning(false);
    onOverwriteConfirm();
  };

  const handleLoadExisting = () => {
    if (existingData && existingData.chart_data) {
      setEditedData(existingData.chart_data);
      setShowOverwriteWarning(false);
    }
  };

  const handleFieldChange = (index: number, field: string, value: string) => {
    const newData = [...editedData];
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      newData[index] = { ...newData[index], [field]: numValue };
      setEditedData(newData);
    }
  };

  const handleSave = () => {
    onSave(editedData);
  };

  // Show overwrite warning if existing data found
  if (showOverwriteWarning) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Existing Data Found</h2>
            <p className="text-slate-400 mb-4">
              You already have saved data for this chart. What would you like to do?
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-400 mb-1">Last updated:</p>
              <p className="text-white font-medium">
                {new Date(existingData.updated_at || existingData.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLoadExisting}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Load Existing Data
            </button>
            <button
              onClick={handleConfirmOverwrite}
              className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              Create New Data
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-900 text-slate-400 font-medium rounded-lg transition-colors border border-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Edit {chartType === 'duration' ? 'Call Duration' : 'Call Outcome'} Data
            </h2>
            <p className="text-slate-400">
              Modify the values below to update the chart
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2">
          {chartType === 'duration' ? (
            // Call Duration Edit Form
            editedData.map((item, index) => (
              <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Time
                    </label>
                    <input
                      type="text"
                      value={item.hour}
                      disabled
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Avg Duration (s)
                    </label>
                    <input
                      type="number"
                      value={item.avgDuration}
                      onChange={(e) => handleFieldChange(index, 'avgDuration', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Total Calls
                    </label>
                    <input
                      type="number"
                      value={item.totalCalls}
                      onChange={(e) => handleFieldChange(index, 'totalCalls', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Call Outcome Edit Form
            editedData.map((item, index) => (
              <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Outcome
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      disabled
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Count
                    </label>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
