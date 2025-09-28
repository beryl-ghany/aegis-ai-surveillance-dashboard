
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
  const { q } = await req.json();
  // In a real system, call CV + VLM agents here. We mock 3 detections and nudge lat/lng.
  const base = [
    { id: "d1", lat: 37.2289, lng: -80.4170, time: "03:16 PM", confidence: 95, camera: "Camera C5", severity: "critical", description: "High-confidence threat detected at main entrance" },
    { id: "d2", lat: 37.2299, lng: -80.4150, time: "03:34 PM", confidence: 88, camera: "Camera C8", severity: "high", description: "Suspicious activity in restricted zone" },
    { id: "d3", lat: 37.2312, lng: -80.4125, time: "03:41 PM", confidence: 82, camera: "Camera C2", severity: "medium", description: "Unusual behavior pattern detected" }
  ];
  // pseudo-random tweak based on query length for demo
  const tweak = (q?.length || 1) % 7 * 0.0005;
  const detections = base.map((d, i)=> ({ ...d, lat: d.lat + tweak*i, lng: d.lng - tweak*(2-i) }));
  return Response.json({ 
    ok: true, 
    detections, 
    message: `Aegis analysis for "${q}" completed.`,
    analysisDetails: {
      agentsUsed: ["AegisVisualAnalyzer", "AegisPatternEngine", "AegisThreatAssessor"],
      processingTime: `${Math.random() * 2 + 1}s`,
      confidence: "High",
      recommendations: [
        "Review high-confidence detections immediately",
        "Monitor pattern trends for anomalies", 
        "Consider additional surveillance in identified hotspots"
      ]
    },
    note: "Mocked analysis. Plug in LaMa/FFC/OpenCV here." 
  });
}
