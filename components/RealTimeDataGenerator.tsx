'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Settings, Activity, MapPin, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface RealTimeDetection {
  id: string;
  lat: number;
  lng: number;
  time: string;
  confidence: number;
  camera: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  personCount?: number;
  vehicleType?: string;
  behavior?: string[];
  clothing?: string[];
}

interface RealTimeDataGeneratorProps {
  onNewDetection: (detection: RealTimeDetection) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function RealTimeDataGenerator({ onNewDetection, isActive, onToggle }: RealTimeDataGeneratorProps) {
  const [settings, setSettings] = useState({
    frequency: 3000, // 3 seconds
    intensity: 50, // 0-100
    scenario: 'mixed' as 'campus' | 'retail' | 'airport' | 'mixed',
    includeVehicles: true,
    includeGroups: true,
    includeBehavior: true,
  });

  const [stats, setStats] = useState({
    totalGenerated: 0,
    lastDetection: null as string | null,
    activeScenarios: 0,
  });

  // Realistic scenarios with different patterns
  const scenarios = {
    campus: {
      locations: [
        { lat: 37.2296, lng: -80.4139, camera: 'Main Entrance', weight: 0.3 },
        { lat: 37.2301, lng: -80.4145, camera: 'Library', weight: 0.2 },
        { lat: 37.2290, lng: -80.4130, camera: 'Parking Lot', weight: 0.2 },
        { lat: 37.2305, lng: -80.4140, camera: 'Dormitory', weight: 0.15 },
        { lat: 37.2285, lng: -80.4150, camera: 'Cafeteria', weight: 0.15 },
      ],
      behaviors: ['walking', 'running', 'loitering', 'gathering', 'sitting'],
      clothing: ['backpack', 'hoodie', 'jeans', 'sweatshirt', 'shorts'],
      descriptions: [
        'Student with backpack near library',
        'Group gathering after hours',
        'Person loitering near dormitory',
        'Suspicious activity in parking lot',
        'Individual running across campus',
      ],
    },
    retail: {
      locations: [
        { lat: 37.2285, lng: -80.4150, camera: 'Store Entrance', weight: 0.4 },
        { lat: 37.2288, lng: -80.4148, camera: 'Aisle 1', weight: 0.2 },
        { lat: 37.2290, lng: -80.4145, camera: 'Aisle 3', weight: 0.2 },
        { lat: 37.2287, lng: -80.4152, camera: 'Checkout', weight: 0.2 },
      ],
      behaviors: ['shopping', 'loitering', 'concealing', 'running', 'arguing'],
      clothing: ['dark clothing', 'hat', 'sunglasses', 'backpack', 'jacket'],
      descriptions: [
        'Customer concealing items',
        'Suspicious behavior in aisle',
        'Person loitering near entrance',
        'Group causing disturbance',
        'Individual with concealed items',
      ],
    },
    airport: {
      locations: [
        { lat: 37.2310, lng: -80.4120, camera: 'Security Checkpoint', weight: 0.3 },
        { lat: 37.2305, lng: -80.4115, camera: 'Terminal 1', weight: 0.25 },
        { lat: 37.2315, lng: -80.4125, camera: 'Terminal 2', weight: 0.25 },
        { lat: 37.2300, lng: -80.4110, camera: 'Baggage Claim', weight: 0.2 },
      ],
      behaviors: ['waiting', 'rushing', 'loitering', 'arguing', 'suspicious movement'],
      clothing: ['suit', 'casual', 'backpack', 'carry-on', 'jacket'],
      descriptions: [
        'Suspicious behavior at checkpoint',
        'Unattended luggage detected',
        'Person rushing through terminal',
        'Group causing disturbance',
        'Individual loitering near gates',
      ],
    },
  };

  const generateDetection = useCallback((): RealTimeDetection => {
    const currentScenario = settings.scenario === 'mixed' 
      ? Object.keys(scenarios)[Math.floor(Math.random() * Object.keys(scenarios).length)] as keyof typeof scenarios
      : settings.scenario;

    const scenario = scenarios[currentScenario];
    
    // Weighted random location selection
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedLocation = scenario.locations[0];
    
    for (const location of scenario.locations) {
      cumulativeWeight += location.weight;
      if (random <= cumulativeWeight) {
        selectedLocation = location;
        break;
      }
    }

    // Add some randomness to coordinates
    const lat = selectedLocation.lat + (Math.random() - 0.5) * 0.001;
    const lng = selectedLocation.lng + (Math.random() - 0.5) * 0.001;

    // Generate realistic confidence based on scenario and time
    const baseConfidence = 40 + Math.random() * 50; // 40-90%
    const timeOfDay = new Date().getHours();
    const confidence = timeOfDay < 6 || timeOfDay > 22 
      ? baseConfidence + 5 // Slightly higher confidence at night
      : baseConfidence;

    // Generate severity based on confidence and behavior
    const severity: RealTimeDetection['severity'] = 
      confidence > 85 ? 'critical' :
      confidence > 75 ? 'high' :
      confidence > 60 ? 'medium' : 'low';

    // Generate person count (1-5 people)
    const personCount = settings.includeGroups 
      ? Math.floor(Math.random() * 5) + 1 
      : 1;

    // Generate vehicle type (if enabled)
    const vehicleTypes = ['car', 'truck', 'van', 'motorcycle', 'bicycle'];
    const vehicleType = settings.includeVehicles && Math.random() > 0.7
      ? vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
      : undefined;

    // Generate behavior patterns
    const behavior = settings.includeBehavior && Math.random() > 0.5
      ? scenario.behaviors.slice(0, Math.floor(Math.random() * 3) + 1)
      : [];

    // Generate clothing description
    const clothing = Math.random() > 0.6
      ? scenario.clothing.slice(0, Math.floor(Math.random() * 3) + 1)
      : [];

    const description = scenario.descriptions[Math.floor(Math.random() * scenario.descriptions.length)];

    return {
      id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lat,
      lng,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: Math.round(confidence),
      camera: selectedLocation.camera,
      description,
      severity,
      personCount,
      vehicleType,
      behavior,
      clothing,
    };
  }, [settings]);

  // Main generation loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Generate detection based on intensity setting
      const shouldGenerate = Math.random() * 100 < settings.intensity;
      if (shouldGenerate) {
        const detection = generateDetection();
        onNewDetection(detection);
        
        setStats(prev => ({
          ...prev,
          totalGenerated: prev.totalGenerated + 1,
          lastDetection: detection.time,
        }));
      }
    }, settings.frequency);

    return () => clearInterval(interval);
  }, [isActive, settings, generateDetection, onNewDetection]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-aegis-card border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">Aegis Data Generator</h3>
            <p className="text-xs text-slate-400">Simulate realistic surveillance data</p>
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

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-sm text-slate-400">
          {isActive ? 'Generating data...' : 'Generator paused'}
        </span>
        {isActive && (
          <span className="text-xs text-slate-500 ml-auto">
            Generated: {stats.totalGenerated}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Generated</span>
          </div>
          <div className="text-lg font-semibold text-slate-200">{stats.totalGenerated}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Last</span>
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {stats.lastDetection || 'None'}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Scenario</span>
          </div>
          <div className="text-sm font-semibold text-slate-200 capitalize">
            {settings.scenario}
          </div>
        </div>
      </div>

      {/* Settings */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300">
          <Settings className="w-4 h-4" />
          Generator Settings
        </summary>
        <div className="mt-3 space-y-3 pt-3 border-t border-slate-700">
          <div>
            <label className="text-xs text-slate-400">Scenario: {settings.scenario}</label>
            <select
              value={settings.scenario}
              onChange={(e) => setSettings(prev => ({ ...prev, scenario: e.target.value as any }))}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
            >
              <option value="campus">Campus Security</option>
              <option value="retail">Retail Security</option>
              <option value="airport">Airport Security</option>
              <option value="mixed">Mixed Scenarios</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-slate-400">Intensity: {settings.intensity}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.intensity}
              onChange={(e) => setSettings(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="text-xs text-slate-400">Frequency: {settings.frequency}ms</label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={settings.frequency}
              onChange={(e) => setSettings(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Data Types</label>
            <div className="space-y-1">
              {[
                { key: 'includeVehicles', label: 'Include Vehicles' },
                { key: 'includeGroups', label: 'Include Groups' },
                { key: 'includeBehavior', label: 'Include Behavior' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
