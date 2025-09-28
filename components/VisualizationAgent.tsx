'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, PieChart, TrendingUp, Activity, Eye, Brain, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Detection } from '../lib/types';

interface ChartData {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'heatmap' | 'scatter' | 'radar';
  title: string;
  description: string;
  data: any[];
  justification: string;
  accessibility: {
    altText: string;
    summary: string;
    keyInsights: string[];
  };
}

interface VisualizationAgentProps {
  detections: Detection[];
  isActive: boolean;
  onToggle: () => void;
}

export default function VisualizationAgent({ detections, isActive, onToggle }: VisualizationAgentProps) {
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [chartHistory, setChartHistory] = useState<ChartData[]>([]);
  const [settings, setSettings] = useState({
    autoUpdate: true,
    chartTypes: ['bar', 'pie', 'line', 'area', 'scatter', 'heatmap', 'radar', 'treemap'],
    justificationLevel: 'comprehensive' as 'brief' | 'detailed' | 'comprehensive',
    dataInsights: true,
    predictiveAnalysis: true,
    realTimeUpdates: true,
  });

  // Generate chart data based on detections
  const generateChartData = useCallback((): ChartData[] => {
    if (detections.length === 0) return [];

    const charts: ChartData[] = [];

    // 1. Confidence Distribution (Bar Chart)
    const confidenceRanges = {
      '40-59%': detections.filter(d => d.confidence >= 40 && d.confidence < 60).length,
      '60-74%': detections.filter(d => d.confidence >= 60 && d.confidence < 75).length,
      '75-84%': detections.filter(d => d.confidence >= 75 && d.confidence < 85).length,
      '85%+': detections.filter(d => d.confidence >= 85).length,
    };

    charts.push({
      id: 'confidence-dist',
      type: 'bar',
      title: 'Confidence Distribution',
      description: 'Distribution of detection confidence levels',
      data: Object.entries(confidenceRanges).map(([range, count]) => ({
        range,
        count,
        percentage: Math.round((count / detections.length) * 100)
      })),
      justification: generateJustification('confidence', confidenceRanges),
      accessibility: {
        altText: `Bar chart showing detection confidence distribution with ${Object.values(confidenceRanges).reduce((a, b) => a + b, 0)} total detections`,
        summary: `Most detections fall in the ${Object.entries(confidenceRanges).reduce((a, b) => a[1] > b[1] ? a : b)[0]} range`,
        keyInsights: [
          `${Object.entries(confidenceRanges).reduce((a, b) => a[1] > b[1] ? a : b)[0]} range has the most detections`,
          `${confidenceRanges['85%+']} high-confidence detections require immediate attention`,
          `${confidenceRanges['40-59%']} low-confidence detections may be false positives`
        ]
      }
    });

    // 2. Severity Breakdown (Pie Chart)
    const severityCounts = {
      low: detections.filter(d => d.severity === 'low').length,
      medium: detections.filter(d => d.severity === 'medium').length,
      high: detections.filter(d => d.severity === 'high').length,
      critical: detections.filter(d => d.severity === 'critical').length,
    };

    charts.push({
      id: 'severity-pie',
      type: 'pie',
      title: 'Threat Severity Breakdown',
      description: 'Distribution of threat severity levels',
      data: Object.entries(severityCounts).map(([severity, count]) => ({
        severity,
        count,
        percentage: Math.round((count / detections.length) * 100),
        color: getSeverityColor(severity as any)
      })),
      justification: generateJustification('severity', severityCounts),
      accessibility: {
        altText: `Pie chart showing threat severity breakdown with ${Object.values(severityCounts).reduce((a, b) => a + b, 0)} total threats`,
        summary: `${severityCounts.critical} critical threats require immediate response`,
        keyInsights: [
          `${severityCounts.critical} critical threats need immediate attention`,
          `${severityCounts.high} high-priority threats require investigation`,
          `${severityCounts.medium + severityCounts.low} medium/low priority threats for monitoring`
        ]
      }
    });

    // 3. Timeline Trend (Line Chart)
    const hourlyData = generateHourlyTrend(detections);
    charts.push({
      id: 'timeline-trend',
      type: 'line',
      title: 'Detection Timeline Trend',
      description: 'Detection frequency over time',
      data: hourlyData,
      justification: generateJustification('timeline', hourlyData),
      accessibility: {
        altText: `Line chart showing detection frequency over time with peak at ${hourlyData.reduce((a, b) => a.count > b.count ? a : b).hour}`,
        summary: `Peak detection activity at ${hourlyData.reduce((a, b) => a.count > b.count ? a : b).hour}`,
        keyInsights: [
          `Peak activity at ${hourlyData.reduce((a, b) => a.count > b.count ? a : b).hour}`,
          `${hourlyData.reduce((a, b) => a.count + b.count, 0)} total detections across all hours`,
          `Activity pattern shows ${hourlyData.length > 0 ? 'consistent' : 'sporadic'} surveillance coverage`
        ]
      }
    });

    // 4. Camera Performance (Area Chart)
    const cameraData = generateCameraPerformance(detections);
    charts.push({
      id: 'camera-performance',
      type: 'area',
      title: 'Camera Performance Analysis',
      description: 'Detection count by camera location',
      data: cameraData,
      justification: generateJustification('camera', cameraData),
      accessibility: {
        altText: `Area chart showing camera performance with ${cameraData.length} cameras`,
        summary: `${cameraData.reduce((a, b) => a.count > b.count ? a : b).camera} has highest detection count`,
        keyInsights: [
          `${cameraData.reduce((a, b) => a.count > b.count ? a : b).camera} is most active camera`,
          `${cameraData.length} cameras providing coverage`,
          `Average ${Math.round(cameraData.reduce((a, b) => a + b.count, 0) / cameraData.length)} detections per camera`
        ]
      }
    });

    // 5. Threat Correlation Matrix (Heatmap)
    const correlationData = generateThreatCorrelation(detections);
    charts.push({
      id: 'threat-correlation',
      type: 'heatmap',
      title: 'Threat Correlation Matrix',
      description: 'Correlation between different threat types and locations',
      data: correlationData,
      justification: generateJustification('correlation', correlationData),
      accessibility: {
        altText: `Heatmap showing threat correlations across ${correlationData.length} threat types`,
        summary: `Strongest correlation: ${correlationData.find(c => c.correlation > 0.8)?.pair || 'No strong correlations found'}`,
        keyInsights: [
          `Identified ${correlationData.filter(c => c.correlation > 0.7).length} strong correlations`,
          `Weakest correlation: ${correlationData.find(c => c.correlation < 0.3)?.pair || 'All correlations are moderate'}`,
          `Correlation analysis helps predict co-occurring threats`
        ]
      }
    });

    // 6. Confidence vs Severity Scatter Plot
    const scatterData = generateConfidenceSeverityScatter(detections);
    charts.push({
      id: 'confidence-severity',
      type: 'scatter',
      title: 'Confidence vs Severity Analysis',
      description: 'Relationship between detection confidence and threat severity',
      data: scatterData,
      justification: generateJustification('scatter', scatterData),
      accessibility: {
        altText: `Scatter plot showing ${scatterData.length} data points for confidence vs severity analysis`,
        summary: `Correlation coefficient: ${scatterData[0]?.correlation || 0} between confidence and severity`,
        keyInsights: [
          `High confidence (${scatterData.filter(d => d.confidence > 80).length}) detections tend to be ${scatterData.filter(d => d.confidence > 80 && d.severity === 'critical').length > 0 ? 'critical' : 'high severity'}`,
          `Low confidence (${scatterData.filter(d => d.confidence < 60).length}) detections are mostly ${scatterData.filter(d => d.confidence < 60 && d.severity === 'low').length > 0 ? 'low severity' : 'medium severity'}`,
          `Data shows ${scatterData[0]?.correlation > 0.5 ? 'strong' : 'weak'} correlation between confidence and severity`
        ]
      }
    });

    // 7. Temporal Pattern Radar Chart
    const radarData = generateTemporalPatterns(detections);
    charts.push({
      id: 'temporal-patterns',
      type: 'radar',
      title: 'Temporal Threat Patterns',
      description: 'Threat intensity across different time periods',
      data: radarData,
      justification: generateJustification('radar', radarData),
      accessibility: {
        altText: `Radar chart showing threat patterns across ${radarData.length} time periods`,
        summary: `Peak threat period: ${radarData.reduce((a, b) => a.intensity > b.intensity ? a : b).period}`,
        keyInsights: [
          `Peak activity during ${radarData.reduce((a, b) => a.intensity > b.intensity ? a : b).period}`,
          `Lowest activity during ${radarData.reduce((a, b) => a.intensity < b.intensity ? a : b).period}`,
          `Pattern analysis reveals ${radarData.length} distinct time-based threat clusters`
        ]
      }
    });

    return charts;
  }, [detections]);

  // Auto-select best chart based on data patterns
  const selectBestChart = useCallback((charts: ChartData[]): ChartData => {
    if (charts.length === 0) return null as any;

    // Priority logic for chart selection
    const criticalThreats = detections.filter(d => d.severity === 'critical').length;
    const highConfidence = detections.filter(d => d.confidence >= 85).length;
    const timeSpan = detections.length > 0 ? 
      new Date().getTime() - new Date(detections[0].time).getTime() : 0;

    // If critical threats exist, show severity breakdown
    if (criticalThreats > 0) {
      return charts.find(c => c.id === 'severity-pie') || charts[0];
    }

    // If high confidence detections, show confidence distribution
    if (highConfidence > detections.length * 0.3) {
      return charts.find(c => c.id === 'confidence-dist') || charts[0];
    }

    // If data spans time, show timeline trend
    if (timeSpan > 3600000) { // More than 1 hour
      return charts.find(c => c.id === 'timeline-trend') || charts[0];
    }

    // Default to camera performance
    return charts.find(c => c.id === 'camera-performance') || charts[0];
  }, [detections]);

  // Auto-update when detections change
  useEffect(() => {
    if (!autoMode || !isActive) return;

    const charts = generateChartData();
    if (charts.length > 0) {
      const bestChart = selectBestChart(charts);
      setSelectedChart(bestChart);
      setChartHistory(prev => [bestChart, ...prev.slice(0, 9)]); // Keep last 10
    }
  }, [detections, autoMode, isActive, generateChartData, selectBestChart]);

  // Helper functions
  const generateJustification = (type: string, data: any): string => {
    const justifications = {
      confidence: `🎯 CONFIDENCE DISTRIBUTION ANALYSIS: This bar chart visualizes detection confidence levels to assess AI model performance. High confidence (85%+) indicates reliable threat detection requiring immediate response, while low confidence (40-59%) suggests potential false positives needing human verification. The distribution pattern reveals model calibration quality and helps optimize confidence thresholds for automated responses.`,
      severity: `🚨 THREAT SEVERITY BREAKDOWN: This pie chart prioritizes security responses by threat severity classification. Critical threats (red) demand immediate intervention, high threats (orange) require rapid response, medium threats (yellow) need investigation, and low threats (green) can be monitored. This visualization enables resource allocation based on threat impact and supports evidence-based security decision making.`,
      timeline: `⏰ TEMPORAL PATTERN ANALYSIS: This line chart reveals time-based threat activity patterns to optimize security staffing and protocols. Peak hours indicate when security should be heightened, while quiet periods may suggest surveillance gaps or successful deterrence. The trend analysis helps predict future threat windows and enables proactive security measures.`,
      camera: `📹 CAMERA PERFORMANCE OPTIMIZATION: This area chart identifies high-performing surveillance locations to optimize camera placement and resource allocation. Cameras with high detection rates indicate effective positioning, while low-performing cameras may need repositioning or maintenance. This analysis supports strategic security infrastructure planning and budget allocation.`,
      correlation: `🔗 THREAT CORRELATION MATRIX: This heatmap reveals relationships between different threat types to identify co-occurring security risks. Strong correlations (red) indicate threats that often happen together, enabling predictive security measures. Weak correlations (green) suggest independent threat patterns. This analysis supports comprehensive threat modeling and response planning.`,
      scatter: `📊 CONFIDENCE-SEVERITY RELATIONSHIP: This scatter plot analyzes the correlation between detection confidence and threat severity to validate AI model accuracy. Strong positive correlation indicates reliable threat assessment, while weak correlation suggests model calibration issues. Data points show individual detections, enabling outlier analysis and model improvement.`,
      radar: `🕐 TEMPORAL THREAT PATTERNS: This radar chart visualizes threat intensity across different time periods to identify peak security risk windows. The multi-dimensional view reveals cyclical patterns, seasonal variations, and optimal security deployment times. This analysis supports shift planning, resource allocation, and predictive security measures.`
    };
    return justifications[type as keyof typeof justifications] || '📈 ADVANCED DATA VISUALIZATION: This chart provides comprehensive data-driven insights for security decision making, enabling evidence-based threat assessment and strategic security planning.';
  };

  const generateHourlyTrend = (dets: Detection[]) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: dets.filter(d => {
        const detHour = parseInt(d.time.split(':')[0]);
        return detHour === hour;
      }).length
    }));
  };

  const generateCameraPerformance = (dets: Detection[]) => {
    const cameraMap = new Map();
    dets.forEach(det => {
      cameraMap.set(det.camera, (cameraMap.get(det.camera) || 0) + 1);
    });
    return Array.from(cameraMap.entries()).map(([camera, count]) => ({
      camera,
      count,
      efficiency: Math.round((count / dets.length) * 100)
    }));
  };

  const generateThreatCorrelation = (dets: Detection[]) => {
    const threatTypes = ['person', 'vehicle', 'object', 'behavior'];
    const correlations = [];
    
    for (let i = 0; i < threatTypes.length; i++) {
      for (let j = i + 1; j < threatTypes.length; j++) {
        const type1 = threatTypes[i];
        const type2 = threatTypes[j];
        const count1 = dets.filter(d => d.description?.toLowerCase().includes(type1)).length;
        const count2 = dets.filter(d => d.description?.toLowerCase().includes(type2)).length;
        const correlation = Math.min(count1, count2) / Math.max(count1, count2) || 0;
        
        correlations.push({
          pair: `${type1} vs ${type2}`,
          correlation: Math.round(correlation * 100) / 100,
          count1,
          count2
        });
      }
    }
    
    return correlations.sort((a, b) => b.correlation - a.correlation);
  };

  const generateConfidenceSeverityScatter = (dets: Detection[]) => {
    const scatterData = dets.map(det => ({
      confidence: det.confidence,
      severity: det.severity === 'critical' ? 4 : det.severity === 'high' ? 3 : det.severity === 'medium' ? 2 : 1,
      severityLabel: det.severity,
      camera: det.camera,
      time: det.time
    }));
    
    // Calculate correlation coefficient
    const n = scatterData.length;
    const sumX = scatterData.reduce((sum, d) => sum + d.confidence, 0);
    const sumY = scatterData.reduce((sum, d) => sum + d.severity, 0);
    const sumXY = scatterData.reduce((sum, d) => sum + d.confidence * d.severity, 0);
    const sumX2 = scatterData.reduce((sum, d) => sum + d.confidence * d.confidence, 0);
    const sumY2 = scatterData.reduce((sum, d) => sum + d.severity * d.severity, 0);
    
    const correlation = n === 0 ? 0 : (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return [{ ...scatterData[0], correlation: Math.round(correlation * 100) / 100 }, ...scatterData.slice(1)];
  };

  const generateTemporalPatterns = (dets: Detection[]) => {
    const periods = [
      { period: 'Early Morning (6-9 AM)', intensity: 0 },
      { period: 'Morning (9-12 PM)', intensity: 0 },
      { period: 'Afternoon (12-3 PM)', intensity: 0 },
      { period: 'Late Afternoon (3-6 PM)', intensity: 0 },
      { period: 'Evening (6-9 PM)', intensity: 0 },
      { period: 'Night (9 PM-12 AM)', intensity: 0 },
      { period: 'Late Night (12-3 AM)', intensity: 0 },
      { period: 'Pre-Dawn (3-6 AM)', intensity: 0 }
    ];
    
    dets.forEach(det => {
      const hour = parseInt(det.time.split(':')[0]);
      let periodIndex = 0;
      
      if (hour >= 6 && hour < 9) periodIndex = 0;
      else if (hour >= 9 && hour < 12) periodIndex = 1;
      else if (hour >= 12 && hour < 15) periodIndex = 2;
      else if (hour >= 15 && hour < 18) periodIndex = 3;
      else if (hour >= 18 && hour < 21) periodIndex = 4;
      else if (hour >= 21 && hour < 24) periodIndex = 5;
      else if (hour >= 0 && hour < 3) periodIndex = 6;
      else if (hour >= 3 && hour < 6) periodIndex = 7;
      
      periods[periodIndex].intensity += 1;
    });
    
    return periods;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444',
      critical: '#DC2626'
    };
    return colors[severity as keyof typeof colors] || '#6B7280';
  };

  const renderChart = (chart: ChartData) => {
    if (!chart) return null;

    switch (chart.type) {
      case 'bar':
        return (
          <div className="space-y-2">
            {chart.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <span className="text-sm text-slate-300">{item.range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-aegis-mint h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-200 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'pie':
        return (
          <div className="grid grid-cols-2 gap-2">
            {chart.data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-slate-800 rounded">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300 capitalize">{item.severity}</span>
                <span className="text-sm font-medium text-slate-200 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        );

      case 'line':
        return (
          <div className="space-y-1">
            {chart.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <span className="text-sm text-slate-300">{item.hour}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-1">
                    <div 
                      className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.count / Math.max(...chart.data.map(d => d.count))) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-200 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'area':
        return (
          <div className="space-y-2">
            {chart.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <span className="text-sm text-slate-300 truncate">{item.camera}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.efficiency}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-200 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'heatmap':
        return (
          <div className="grid grid-cols-2 gap-2">
            {chart.data.map((item, index) => (
              <div key={index} className="p-2 bg-slate-800 rounded">
                <div className="text-xs text-slate-400 mb-1">{item.pair}</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.correlation * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {item.correlation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'scatter':
        return (
          <div className="space-y-2">
            {chart.data.slice(0, 8).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: item.severity === 4 ? '#ef4444' : 
                                     item.severity === 3 ? '#f59e0b' : 
                                     item.severity === 2 ? '#eab308' : '#10b981'
                    }}
                  />
                  <span className="text-sm text-slate-300">{item.confidence}%</span>
                </div>
                <span className="text-xs text-slate-400 capitalize">{item.severityLabel}</span>
              </div>
            ))}
            {chart.data.length > 8 && (
              <div className="text-xs text-slate-500 text-center">
                +{chart.data.length - 8} more data points
              </div>
            )}
          </div>
        );

      case 'radar':
        return (
          <div className="space-y-2">
            {chart.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <span className="text-sm text-slate-300">{item.period}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.intensity / Math.max(...chart.data.map(d => d.intensity))) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-200 w-8 text-right">
                    {item.intensity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-slate-400 text-center py-4">Chart type not supported</div>;
    }
  };

  return (
    <div className="bg-aegis-card border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">Aegis Auto Visualizer</h3>
            <p className="text-xs text-slate-400">Advanced AI-powered chart selection & real-time analysis</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isActive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
          aria-label={isActive ? 'Stop visualization agent' : 'Start visualization agent'}
        >
          {isActive ? <Activity className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isActive ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-sm text-slate-400">
          {isActive ? 'Analyzing data patterns...' : 'Visualization paused'}
        </span>
        {isActive && selectedChart && (
          <span className="text-xs text-slate-500 ml-auto">
            Auto-selected: {selectedChart.title}
          </span>
        )}
      </div>

      {/* Current Chart */}
      {isActive && selectedChart && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-200">{selectedChart.title}</h4>
              <div className="flex items-center gap-2">
                {selectedChart.type === 'bar' && <BarChart3 className="w-4 h-4 text-slate-400" />}
                {selectedChart.type === 'pie' && <PieChart className="w-4 h-4 text-slate-400" />}
                {selectedChart.type === 'line' && <TrendingUp className="w-4 h-4 text-slate-400" />}
                {selectedChart.type === 'area' && <Activity className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">{selectedChart.description}</p>
            
            {renderChart(selectedChart)}
          </div>

          {/* Justification */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-blue-300 mb-1">AI Justification</h5>
                <p className="text-xs text-blue-200">{selectedChart.justification}</p>
              </div>
            </div>
          </div>

          {/* Accessibility Info */}
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300">
              <Eye className="w-4 h-4" />
              Accessibility Information
            </summary>
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-700">
              <div>
                <span className="text-xs text-slate-400">Alt Text:</span>
                <p className="text-xs text-slate-300 mt-1">{selectedChart.accessibility.altText}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Summary:</span>
                <p className="text-xs text-slate-300 mt-1">{selectedChart.accessibility.summary}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Key Insights:</span>
                <ul className="text-xs text-slate-300 mt-1 space-y-1">
                  {selectedChart.accessibility.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-aegis-mint mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </motion.div>
      )}

      {/* Chart History */}
      {chartHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Recent Charts</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {chartHistory.slice(0, 5).map((chart, index) => (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart)}
                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                  selectedChart?.id === chart.id 
                    ? 'bg-aegis-mint/20 text-aegis-mint' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {chart.title} ({chart.type})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300">
          <Settings className="w-4 h-4" />
          Advanced Visualization Settings
        </summary>
        <div className="mt-3 space-y-4 pt-3 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoMode"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoMode" className="text-xs text-slate-400">Auto-select best chart</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoUpdate"
                checked={settings.autoUpdate}
                onChange={(e) => setSettings(prev => ({ ...prev, autoUpdate: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="autoUpdate" className="text-xs text-slate-400">Real-time updates</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dataInsights"
                checked={settings.dataInsights}
                onChange={(e) => setSettings(prev => ({ ...prev, dataInsights: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="dataInsights" className="text-xs text-slate-400">Data insights</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="predictiveAnalysis"
                checked={settings.predictiveAnalysis}
                onChange={(e) => setSettings(prev => ({ ...prev, predictiveAnalysis: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="predictiveAnalysis" className="text-xs text-slate-400">Predictive analysis</label>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-2">Justification Level</label>
            <select
              value={settings.justificationLevel}
              onChange={(e) => setSettings(prev => ({ ...prev, justificationLevel: e.target.value as any }))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
            >
              <option value="brief">Brief</option>
              <option value="detailed">Detailed</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Available Chart Types</label>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
              {settings.chartTypes.map(type => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-aegis-mint rounded-full"></div>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
