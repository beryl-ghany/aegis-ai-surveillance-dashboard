'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Settings, AlertTriangle, Eye, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreatDetection {
  id: string;
  timestamp: string;
  confidence: number;
  threatType: 'person' | 'vehicle' | 'object' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number };
  camera: string;
  description: string;
  imageUrl?: string;
}

interface AutoVisualAgentProps {
  onNewDetection: (detection: ThreatDetection) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function AutoVisualAgent({ onNewDetection, isActive, onToggle }: AutoVisualAgentProps) {
  const [detections, setDetections] = useState<ThreatDetection[]>([]);
  const [settings, setSettings] = useState({
    sensitivity: 75,
    autoAlert: true,
    maxDetections: 100,
    analysisInterval: 2000, // 2 seconds
  });
  const [stats, setStats] = useState({
    totalDetections: 0,
    threatsBlocked: 0,
    falsePositives: 0,
    uptime: 0,
  });

  // Simulate real-time threat detection
  const simulateDetection = useCallback(() => {
    if (!isActive) return;

    const threatTypes: ThreatDetection['threatType'][] = ['person', 'vehicle', 'object', 'behavior'];
    const severities: ThreatDetection['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    // Generate random detection based on sensitivity
    const randomValue = Math.random() * 100;
    if (randomValue < settings.sensitivity / 10) {
      const detection: ThreatDetection = {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        confidence: Math.floor(Math.random() * 50) + 40, // 40-90%
        threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        location: {
          lat: 37.2289 + (Math.random() - 0.5) * 0.01,
          lng: -80.4170 + (Math.random() - 0.5) * 0.01,
        },
        camera: `Camera C${Math.floor(Math.random() * 10) + 1}`,
        description: generateThreatDescription(),
      };

      setDetections(prev => {
        const newDetections = [detection, ...prev].slice(0, settings.maxDetections);
        setStats(prevStats => ({
          ...prevStats,
          totalDetections: prevStats.totalDetections + 1,
          threatsBlocked: detection.severity === 'critical' ? prevStats.threatsBlocked + 1 : prevStats.threatsBlocked,
        }));
        return newDetections;
      });

      onNewDetection(detection);
    }
  }, [isActive, settings.sensitivity, settings.maxDetections, onNewDetection]);

  // Generate realistic threat descriptions
  const generateThreatDescription = () => {
    const descriptions = [
      "Suspicious individual loitering near entrance",
      "Unattended package detected",
      "Person wearing mask and hood in restricted area",
      "Vehicle circling building multiple times",
      "Group of individuals gathering after hours",
      "Person attempting to access restricted door",
      "Suspicious behavior near security checkpoint",
      "Unknown individual in staff-only area",
      "Vehicle parked in no-parking zone for extended period",
      "Person taking photos of security infrastructure",
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  // Auto-detection interval
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(simulateDetection, settings.analysisInterval);
    return () => clearInterval(interval);
  }, [simulateDetection, isActive, settings.analysisInterval]);

  // Uptime counter
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: ThreatDetection['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="bg-aegis-card border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aegis-mint/20 rounded-lg">
            <Brain className="w-5 h-5 text-aegis-mint" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">Aegis Auto Visual Agent</h3>
            <p className="text-xs text-slate-400">AI-powered threat detection</p>
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
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-sm text-slate-400">
          {isActive ? 'Monitoring active' : 'Monitoring paused'}
        </span>
        {isActive && (
          <span className="text-xs text-slate-500 ml-auto">
            Uptime: {formatUptime(stats.uptime)}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Detections</span>
          </div>
          <div className="text-lg font-semibold text-slate-200">{stats.totalDetections}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Threats Blocked</span>
          </div>
          <div className="text-lg font-semibold text-slate-200">{stats.threatsBlocked}</div>
        </div>
      </div>

      {/* Recent Detections */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-2">Recent Detections</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <AnimatePresence>
            {detections.slice(0, 5).map((detection) => (
              <motion.div
                key={detection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-2 rounded-lg border text-xs ${getSeverityColor(detection.severity)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">{detection.threatType}</span>
                  <span className="text-xs opacity-75">{detection.timestamp}</span>
                </div>
                <div className="text-xs opacity-90">{detection.description}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">{detection.camera}</span>
                  <span className="text-xs font-medium">{detection.confidence}%</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300">
          <Settings className="w-4 h-4" />
          Agent Settings
        </summary>
        <div className="mt-3 space-y-3 pt-3 border-t border-slate-700">
          <div>
            <label className="text-xs text-slate-400">Sensitivity: {settings.sensitivity}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.sensitivity}
              onChange={(e) => setSettings(prev => ({ ...prev, sensitivity: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Analysis Interval: {settings.analysisInterval}ms</label>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={settings.analysisInterval}
              onChange={(e) => setSettings(prev => ({ ...prev, analysisInterval: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAlert"
              checked={settings.autoAlert}
              onChange={(e) => setSettings(prev => ({ ...prev, autoAlert: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="autoAlert" className="text-xs text-slate-400">Auto-alert on threats</label>
          </div>
        </div>
      </details>
    </div>
  );
}
