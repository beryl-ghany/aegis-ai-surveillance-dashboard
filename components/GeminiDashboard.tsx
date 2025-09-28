'use client';

import { useState, useEffect } from 'react';
import { Brain, FileText, TrendingUp, AlertTriangle, Download, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Detection } from '../lib/types';

interface GeminiAnalysis {
  threatAssessment: string;
  patternAnalysis: string;
  recommendations: string;
  complianceCheck: string;
  timelineAnalysis: string;
  resourceAllocation: string;
}

interface GeminiReport {
  report: string;
  metadata: {
    reportType: string;
    timeframe: string;
    incidentCount: number;
    generatedAt: string;
  };
}

interface ThreatPrediction {
  threatPredictions: any;
  riskAssessment: any;
  predictiveInsights: any;
  preventiveRecommendations: any;
  uncertaintyAnalysis: any;
}

interface GeminiDashboardProps {
  detections: Detection[];
  isActive: boolean;
  onToggle: () => void;
}

export default function GeminiDashboard({ detections, isActive, onToggle }: GeminiDashboardProps) {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [report, setReport] = useState<GeminiReport | null>(null);
  const [predictions, setPredictions] = useState<ThreatPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'report' | 'predictions'>('analysis');

  // Auto-analyze when detections change
  useEffect(() => {
    if (isActive && detections.length > 0) {
      handleAnalysis();
    }
  }, [detections, isActive]);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gemini/analyze-detections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections,
          analysisType: 'comprehensive'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections,
          reportType: 'Security Intelligence Report',
          timeframe: 'Last 24 hours'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Report generation failed');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePredictThreats = async () => {
    setIsPredicting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gemini/predict-threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections,
          predictionHorizon: 'Next 6 hours'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }
      
      const data = await response.json();
      setPredictions(data.predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-security-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="bg-aegis-card border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">Aegis Intelligence</h3>
            <p className="text-xs text-slate-400">Powered by Google Gemini AI</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isActive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          {isActive ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-sm text-slate-400">
          {isActive ? 'AI analysis active' : 'AI analysis disabled'}
        </span>
        {detections.length > 0 && (
          <span className="text-xs text-slate-500 ml-auto">
            {detections.length} detections analyzed
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
        {[
          { id: 'analysis', label: 'Analysis', icon: Brain },
          { id: 'report', label: 'Report', icon: FileText },
          { id: 'predictions', label: 'Predictions', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === id
                ? 'bg-aegis-mint text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-200">AI Threat Analysis</h4>
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || !isActive}
                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>

              {analysis ? (
                <div className="space-y-3">
                  {Object.entries(analysis).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-slate-300 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <p className="text-sm text-slate-400">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  {isAnalyzing ? 'AI is analyzing your data...' : 'Click refresh to start analysis'}
                </div>
              )}
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-200">AI-Generated Report</h4>
                <div className="flex gap-2">
                  {report && (
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport || !isActive}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {isGeneratingReport ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>

              {report ? (
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Report Metadata</h5>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Type: {report.metadata.reportType}</div>
                      <div>Timeframe: {report.metadata.timeframe}</div>
                      <div>Incidents: {report.metadata.incidentCount}</div>
                      <div>Generated: {new Date(report.metadata.generatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">{report.report}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  {isGeneratingReport ? 'AI is generating your report...' : 'Click generate to create a security report'}
                </div>
              )}
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-200">Threat Predictions</h4>
                <button
                  onClick={handlePredictThreats}
                  disabled={isPredicting || !isActive}
                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isPredicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  {isPredicting ? 'Predicting...' : 'Predict'}
                </button>
              </div>

              {predictions ? (
                <div className="space-y-3">
                  {Object.entries(predictions).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-slate-300 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <div className="text-sm text-slate-400">
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  {isPredicting ? 'AI is predicting future threats...' : 'Click predict to analyze future threats'}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-400">{error}</div>
        </div>
      )}

      {/* Quick Stats */}
      {detections.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-slate-400">Total Detections</div>
            <div className="font-medium text-slate-200">{detections.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-slate-400">Critical Threats</div>
            <div className="font-medium text-red-400">
              {detections.filter(d => d.severity === 'critical').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
