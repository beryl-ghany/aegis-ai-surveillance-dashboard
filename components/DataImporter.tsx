'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Camera, MapPin, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImportedDetection {
  id: string;
  lat: number;
  lng: number;
  time: string;
  confidence: number;
  camera: string;
  description?: string;
  imageUrl?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface DataImporterProps {
  onImportData: (detections: ImportedDetection[]) => void;
  onClearData: () => void;
}

export default function DataImporter({ onImportData, onClearData }: DataImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importType, setImportType] = useState<'csv' | 'json' | 'manual' | 'sample'>('sample');
  const [manualData, setManualData] = useState({
    lat: '37.2289',
    lng: '-80.4170',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    confidence: '85',
    camera: 'Camera C1',
    description: 'Suspicious individual detected',
    severity: 'medium' as const,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data sets for testing
  const sampleDataSets = {
    'campus_security': [
      {
        id: 'campus_1',
        lat: 37.2296,
        lng: -80.4139,
        time: '14:30',
        confidence: 87,
        camera: 'Main Entrance',
        description: 'Person in restricted area after hours',
        severity: 'high' as const,
      },
      {
        id: 'campus_2',
        lat: 37.2301,
        lng: -80.4145,
        time: '14:35',
        confidence: 65,
        camera: 'Library Cam 3',
        description: 'Unattended backpack detected',
        severity: 'medium' as const,
      },
      {
        id: 'campus_3',
        lat: 37.2290,
        lng: -80.4130,
        time: '14:40',
        confidence: 92,
        camera: 'Parking Lot B',
        description: 'Suspicious vehicle circling',
        severity: 'critical' as const,
      },
    ],
    'retail_security': [
      {
        id: 'retail_1',
        lat: 37.2285,
        lng: -80.4150,
        time: '15:15',
        confidence: 83,
        camera: 'Store Entrance',
        description: 'Shoplifting suspect - black hoodie',
        severity: 'high' as const,
      },
      {
        id: 'retail_2',
        lat: 37.2288,
        lng: -80.4148,
        time: '15:18',
        confidence: 58,
        camera: 'Aisle 3',
        description: 'Person concealing items',
        severity: 'low' as const,
      },
    ],
    'airport_security': [
      {
        id: 'airport_1',
        lat: 37.2310,
        lng: -80.4120,
        time: '16:00',
        confidence: 91,
        camera: 'Security Checkpoint A',
        description: 'Suspicious behavior at checkpoint',
        severity: 'critical' as const,
      },
      {
        id: 'airport_2',
        lat: 37.2305,
        lng: -80.4115,
        time: '16:05',
        confidence: 77,
        camera: 'Terminal 1',
        description: 'Unattended luggage',
        severity: 'high' as const,
      },
    ],
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let detections: ImportedDetection[] = [];

        if (importType === 'csv') {
          detections = parseCSV(content);
        } else if (importType === 'json') {
          detections = JSON.parse(content);
        }

        onImportData(detections);
        setIsOpen(false);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format.');
      }
    };

    if (importType === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const parseCSV = (content: string): ImportedDetection[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const detections: ImportedDetection[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 6) {
        detections.push({
          id: `imported_${Date.now()}_${i}`,
          lat: parseFloat(values[0]) || 37.2289,
          lng: parseFloat(values[1]) || -80.4170,
          time: values[2] || new Date().toLocaleTimeString(),
          confidence: parseInt(values[3]) || 75,
          camera: values[4] || 'Imported Camera',
          description: values[5] || 'Imported detection',
          severity: (values[6] as any) || 'medium',
        });
      }
    }

    return detections;
  };

  const handleSampleData = (dataset: keyof typeof sampleDataSets) => {
    onImportData(sampleDataSets[dataset]);
    setIsOpen(false);
  };

  const handleManualSubmit = () => {
    const detection: ImportedDetection = {
      id: `manual_${Date.now()}`,
      lat: parseFloat(manualData.lat),
      lng: parseFloat(manualData.lng),
      time: manualData.time,
      confidence: parseInt(manualData.confidence),
      camera: manualData.camera,
      description: manualData.description,
      severity: manualData.severity,
    };

    onImportData([detection]);
    setIsOpen(false);
  };

  const downloadSampleCSV = () => {
    const csvContent = `lat,lng,time,confidence,camera,description,severity
37.2289,-80.4170,14:30,87,Main Entrance,Person in restricted area,high
37.2295,-80.4165,14:35,65,Library Cam 3,Unattended backpack,medium
37.2300,-80.4160,14:40,92,Parking Lot B,Suspicious vehicle,critical
37.2285,-80.4150,14:45,58,Store Aisle,Person concealing items,low
37.2310,-80.4120,14:50,91,Security Checkpoint,Suspicious behavior,critical`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_detections.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-aegis-card border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-aegis-mint" />
          <h3 className="font-semibold text-slate-200">Aegis Data Importer</h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 bg-aegis-mint/20 text-aegis-mint rounded-md hover:bg-aegis-mint/30 transition-colors text-sm"
        >
          {isOpen ? 'Close' : 'Import Data'}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Import Type Selection */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Import Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'sample', label: 'Sample Data', icon: FileText },
                { value: 'manual', label: 'Manual Entry', icon: Camera },
                { value: 'csv', label: 'CSV File', icon: Upload },
                { value: 'json', label: 'JSON File', icon: FileText },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setImportType(value as any)}
                  className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                    importType === value
                      ? 'bg-aegis-mint/20 text-aegis-mint'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Data Sets */}
          {importType === 'sample' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Sample Data Sets</label>
              <div className="space-y-2">
                {Object.entries(sampleDataSets).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleSampleData(key as keyof typeof sampleDataSets)}
                    className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="text-left">
                      <div className="font-medium text-slate-200 capitalize">
                        {key.replace('_', ' ')} Security
                      </div>
                      <div className="text-xs text-slate-400">
                        {data.length} detections
                      </div>
                    </div>
                    <AlertCircle className="w-4 h-4 text-aegis-mint" />
                  </button>
                ))}
                <button
                  onClick={downloadSampleCSV}
                  className="w-full flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Download Sample CSV Template
                </button>
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          {importType === 'manual' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualData.lat}
                    onChange={(e) => setManualData(prev => ({ ...prev, lat: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualData.lng}
                    onChange={(e) => setManualData(prev => ({ ...prev, lng: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Time</label>
                  <input
                    type="text"
                    value={manualData.time}
                    onChange={(e) => setManualData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Confidence (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualData.confidence}
                    onChange={(e) => setManualData(prev => ({ ...prev, confidence: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Camera</label>
                <input
                  type="text"
                  value={manualData.camera}
                  onChange={(e) => setManualData(prev => ({ ...prev, camera: e.target.value }))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  value={manualData.description}
                  onChange={(e) => setManualData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Severity</label>
                <select
                  value={manualData.severity}
                  onChange={(e) => setManualData(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button
                onClick={handleManualSubmit}
                className="w-full bg-aegis-mint text-slate-900 py-2 rounded-md hover:bg-aegis-mint/80 transition-colors"
              >
                Add Detection
              </button>
            </div>
          )}

          {/* File Upload */}
          {(importType === 'csv' || importType === 'json') && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Upload {importType.toUpperCase()} File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept={importType === 'csv' ? '.csv' : '.json'}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 rounded-lg hover:border-aegis-mint transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-slate-400">Click to upload {importType.toUpperCase()} file</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <button
              onClick={onClearData}
              className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/30 transition-colors"
            >
              Clear All Data
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-slate-700 text-slate-300 py-2 rounded-md hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
