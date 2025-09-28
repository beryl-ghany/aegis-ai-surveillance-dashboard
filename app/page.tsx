
'use client';

import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import dynamic from "next/dynamic";

// Make MapView client-side only to fix SSR issues
const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] rounded-lg border border-slate-800 flex items-center justify-center bg-aegis-card">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aegis-mint mx-auto mb-2"></div>
        <p className="text-slate-400">Loading map...</p>
      </div>
    </div>
  )
});
import Timeline from "../components/Timeline";
import DetectionsGrid from "../components/DetectionsGrid";
import ChatBot from "../components/ChatBot";
import AuditLog, { AuditEvent } from "../components/AuditLog";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";
import AutoVisualAgent from "../components/AutoVisualAgent";
import DataImporter from "../components/DataImporter";
import RealTimeDataGenerator from "../components/RealTimeDataGenerator";
import VisualizationAgent from "../components/VisualizationAgent";
import GeminiDashboard from "../components/GeminiDashboard";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { Detection } from "../lib/types";
import { useState, useRef } from "react";


const seed: Detection[] = [
  { id: "d1", lat: 37.2289, lng: -80.4170, time: "03:16 PM", confidence: 91, camera: "Camera C5", severity: "critical", description: "Suspicious person detected near main entrance" },
  { id: "d2", lat: 37.2299, lng: -80.4150, time: "03:34 PM", confidence: 67, camera: "Camera C8", severity: "medium", description: "Unattended package left in restricted area" },
  { id: "d3", lat: 37.2312, lng: -80.4125, time: "03:41 PM", confidence: 58, camera: "Camera C2", severity: "low", description: "Person loitering in parking lot" }
];

export default function Page(){
  const [detections, setDetections] = useState<Detection[]>(seed);
  const [log, setLog] = useState<AuditEvent[]>([
    { time: "03:10 PM", actor: "AegisInpaint", action: "Restored 12 frames (LaMa+FFC)", detail: "Masks auto-generated; homography align succeeded." },
    { time: "03:12 PM", actor: "AegisReID", action: "Person match across 3 cameras", detail: "OpenCV + VLM query: 'black hoodie near station'." }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<number>(0);
  const [isAutoAgentActive, setIsAutoAgentActive] = useState(false);
  const [isDataGeneratorActive, setIsDataGeneratorActive] = useState(false);
  const [isVisualizationActive, setIsVisualizationActive] = useState(false);
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  async function analyze(q: string){
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const res = await fetch("/api/agents/analyze", { 
        method: "POST", 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q }) 
      });
      
      if (!res.ok) {
        throw new Error(`Analysis failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      setDetections(data.detections || []);
      setLog(prev => [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }), actor: "Aegis", action: "Analysis completed", detail: `Found ${data.detections?.length || 0} detections for query: "${q}"` },
        ...prev
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Keyboard navigation
  useKeyboardNavigation({
    onArrowUp: () => {
      if (detections.length > 0) {
        setSelectedDetection(prev => Math.max(0, prev - 1));
      }
    },
    onArrowDown: () => {
      if (detections.length > 0) {
        setSelectedDetection(prev => Math.min(detections.length - 1, prev + 1));
      }
    },
    onEscape: () => {
      setError(null);
      setIsAnalyzing(false);
    },
    onEnter: () => {
      if (detections.length > 0) {
        // Focus on selected detection
        const selected = detections[selectedDetection];
        if (selected) {
          // Scroll to detection in grid or highlight on map
          console.log('Selected detection:', selected);
        }
      }
    }
  });

  // Handle new detections from auto visual agent
  const handleNewDetection = (detection: any) => {
    const newDetection: Detection = {
      id: detection.id,
      lat: detection.location.lat,
      lng: detection.location.lng,
      time: detection.timestamp,
      confidence: detection.confidence,
      camera: detection.camera,
      severity: detection.severity || 'medium',
      description: detection.description || 'Auto-detected threat',
    };
    
    setDetections(prev => [newDetection, ...prev]);
    setLog(prev => [
      { 
        time: detection.timestamp, 
        actor: "AutoVisualAgent", 
        action: `Detected ${detection.threatType}`, 
        detail: `${detection.description} (${detection.severity} severity)` 
      },
      ...prev
    ]);
  };

  // Handle imported data
  const handleImportData = (importedDetections: any[]) => {
    const newDetections: Detection[] = importedDetections.map(detection => ({
      id: detection.id,
      lat: detection.lat,
      lng: detection.lng,
      time: detection.time,
      confidence: detection.confidence,
      camera: detection.camera,
      severity: detection.severity || 'medium',
      description: detection.description || 'Imported detection',
    }));

    setDetections(prev => [...newDetections, ...prev]);
    setLog(prev => [
      { 
        time: new Date().toLocaleTimeString(), 
        actor: "DataImporter", 
        action: `Imported ${importedDetections.length} detections`, 
        detail: `From ${importedDetections[0]?.camera || 'unknown source'}` 
      },
      ...prev
    ]);
  };

  // Handle clearing all data
  const handleClearData = () => {
    setDetections([]);
    setLog(prev => [
      { 
        time: new Date().toLocaleTimeString(), 
        actor: "DataImporter", 
        action: "Cleared all data", 
        detail: "All detections and logs have been reset" 
      },
      ...prev
    ]);
  };

  // Handle real-time data generation
  const handleRealTimeDetection = (detection: any) => {
    const newDetection: Detection = {
      id: detection.id,
      lat: detection.lat,
      lng: detection.lng,
      time: detection.time,
      confidence: detection.confidence,
      camera: detection.camera,
      severity: detection.severity || 'medium',
      description: detection.description || 'Real-time detection',
    };
    
    setDetections(prev => [newDetection, ...prev]);
    setLog(prev => [
      { 
        time: detection.time, 
        actor: "RealTimeGenerator", 
        action: `Generated ${detection.severity} threat`, 
        detail: `${detection.description} (${detection.personCount || 1} person${(detection.personCount || 1) > 1 ? 's' : ''})` 
      },
      ...prev
    ]);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-[1400px] w-full px-4 py-4 grid grid-cols-1 md:grid-cols-[384px_minmax(0,1fr)] gap-4">
          <div className="space-y-4">
            <Sidebar onAnalyze={analyze} isLoading={isAnalyzing} error={error}/>
            <DataImporter 
              onImportData={handleImportData}
              onClearData={handleClearData}
            />
            <AutoVisualAgent 
              onNewDetection={handleNewDetection}
              isActive={isAutoAgentActive}
              onToggle={() => setIsAutoAgentActive(!isAutoAgentActive)}
            />
            <RealTimeDataGenerator
              onNewDetection={handleRealTimeDetection}
              isActive={isDataGeneratorActive}
              onToggle={() => setIsDataGeneratorActive(!isDataGeneratorActive)}
            />
            <VisualizationAgent
              detections={detections}
              isActive={isVisualizationActive}
              onToggle={() => setIsVisualizationActive(!isVisualizationActive)}
            />
            <GeminiDashboard
              detections={detections}
              isActive={isGeminiActive}
              onToggle={() => setIsGeminiActive(!isGeminiActive)}
            />
          </div>
          <div className="space-y-4">
            <ErrorBoundary>
              <MapView detections={detections}/>
            </ErrorBoundary>
            <ErrorBoundary>
              <Timeline items={detections}/>
            </ErrorBoundary>
            <ErrorBoundary>
              <DetectionsGrid items={detections}/>
            </ErrorBoundary>
            <ErrorBoundary>
              <AuditLog items={log}/>
            </ErrorBoundary>
            <ErrorBoundary>
              <ChatBot />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
