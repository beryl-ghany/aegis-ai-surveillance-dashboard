import { NextRequest, NextResponse } from 'next/server';

interface Detection {
  id: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  camera: string;
  description?: string;
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  try {
    const { detections, analysisType } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock data when API key is not available
      const mockAnalysis = {
        threatAssessment: "Mock Analysis: 3 detections analyzed. Overall security posture is moderate with 1 critical threat requiring immediate attention.",
        patternAnalysis: "Mock Pattern: Detections show clustering around main entrance area. Time-based analysis indicates increased activity during evening hours.",
        recommendations: "Mock Recommendations: 1) Increase patrol frequency at main entrance 2) Review camera positioning for better coverage 3) Implement additional lighting",
        complianceCheck: "Mock Compliance: All detections properly logged with timestamps. Chain of custody maintained. GDPR compliance verified for data retention.",
        timelineAnalysis: "Mock Timeline: Peak detection time at 14:30-15:00. Critical threat occurred at 14:45 requiring immediate response protocol activation.",
        resourceAllocation: "Mock Resources: Deploy 2 additional security personnel to main entrance. Activate backup camera system. Notify local law enforcement of critical threat."
      };
      
      return NextResponse.json({
        success: true,
        analysis: mockAnalysis,
        rawResponse: "Mock analysis - Gemini API key not configured",
        timestamp: new Date().toISOString(),
        model: "mock-analysis"
      });
    }

    // Prepare context for Gemini
    const detectionSummary = detections.map((d: Detection) => ({
      id: d.id,
      confidence: d.confidence,
      severity: d.severity,
      time: d.time,
      camera: d.camera,
      description: d.description,
      location: `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}`
    }));

    const prompt = `You are an AI security analyst for the Aegis surveillance system. Analyze the following detection data and provide comprehensive insights.

DETECTION DATA:
${JSON.stringify(detectionSummary, null, 2)}

ANALYSIS TYPE: ${analysisType}

Please provide:
1. **Threat Assessment**: Overall security posture and risk level
2. **Pattern Analysis**: Any suspicious patterns or anomalies
3. **Recommendations**: Specific actions to take
4. **Compliance Check**: Any regulatory concerns
5. **Timeline Analysis**: Critical time periods to monitor
6. **Resource Allocation**: Which cameras/areas need attention

Format your response as a structured JSON object with these sections. Be specific and actionable.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis failed";

    // Try to parse as JSON, fallback to text
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = {
        threatAssessment: analysisText,
        patternAnalysis: "Analysis provided in text format",
        recommendations: "See threat assessment for details",
        complianceCheck: "Manual review recommended",
        timelineAnalysis: "See threat assessment for details",
        resourceAllocation: "See threat assessment for details"
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
      rawResponse: analysisText,
      timestamp: new Date().toISOString(),
      model: "gemini-1.5-flash"
    });

  } catch (error) {
    console.error('Gemini analysis error:', error);
    return NextResponse.json({ 
      error: "Failed to analyze detections with Gemini",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
