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
    const { detections, predictionHorizon } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock predictions when API key is not available
      const mockPredictions = {
        threatPredictions: {
          "High Risk Scenario": {
            probability: 75,
            description: "Increased activity expected around main entrance based on historical patterns",
            timeframe: "Next 2-4 hours"
          },
          "Medium Risk Scenario": {
            probability: 45,
            description: "Potential security breach attempt during low-traffic hours",
            timeframe: "Next 6-8 hours"
          },
          "Low Risk Scenario": {
            probability: 20,
            description: "Routine security incidents with minimal impact",
            timeframe: "Next 12-24 hours"
          }
        },
        riskAssessment: {
          highRiskPeriods: ["14:00-16:00", "20:00-22:00"],
          vulnerableLocations: ["Main Entrance", "Parking Lot C"],
          riskFactors: ["Low lighting", "High foot traffic", "Limited camera coverage"]
        },
        predictiveInsights: {
          expectedDetectionVolume: Math.floor(detections.length * 1.2),
          severityDistribution: {
            critical: Math.floor(detections.filter(d => d.severity === 'critical').length * 1.1),
            high: Math.floor(detections.filter(d => d.severity === 'high').length * 1.3),
            medium: Math.floor(detections.filter(d => d.severity === 'medium').length * 0.9),
            low: Math.floor(detections.filter(d => d.severity === 'low').length * 1.1)
          },
          geographicHotspots: ["Main Entrance", "Library Cam 1", "Parking Lot C"]
        },
        preventiveRecommendations: [
          "Deploy additional security personnel during peak hours",
          "Increase camera coverage in identified hotspots",
          "Implement motion-activated lighting in vulnerable areas",
          "Review and update security protocols for high-risk scenarios"
        ],
        uncertaintyAnalysis: {
          confidenceLevel: "Moderate (75%)",
          riskFactors: ["Weather conditions", "Special events", "System maintenance"],
          monitoringPoints: ["Camera functionality", "Personnel availability", "External threats"]
        }
      };

      return NextResponse.json({
        success: true,
        predictions: mockPredictions,
        metadata: {
          predictionHorizon: predictionHorizon || 'Next 6 hours',
          historicalIncidents: detections.length,
          generatedAt: new Date().toISOString(),
          model: "mock-prediction-engine",
          confidence: "Moderate"
        }
      });
    }

    // Prepare historical data for Gemini
    const historicalData = detections.map((d: Detection) => ({
      id: d.id,
      confidence: d.confidence,
      severity: d.severity,
      time: d.time,
      camera: d.camera,
      description: d.description,
      location: `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}`
    }));

    const prompt = `You are an AI security analyst with advanced predictive capabilities for the Aegis surveillance system. Analyze the historical detection data and provide threat predictions.

HISTORICAL DATA (${detections.length} incidents):
${JSON.stringify(historicalData, null, 2)}

PREDICTION HORIZON: ${predictionHorizon}

Using pattern recognition, temporal analysis, and security intelligence, provide:

1. **THREAT PREDICTION ANALYSIS**
   - Most likely threat scenarios in the next ${predictionHorizon}
   - Probability scores for each prediction (0-100%)
   - Confidence level in predictions

2. **RISK ASSESSMENT**
   - High-risk time periods
   - Vulnerable locations/cameras
   - Potential attack vectors
   - Seasonal/cyclical patterns

3. **PREDICTIVE INSIGHTS**
   - Expected detection volume
   - Severity distribution predictions
   - Geographic hotspots
   - Temporal patterns

4. **PREVENTIVE RECOMMENDATIONS**
   - Proactive security measures
   - Resource deployment suggestions
   - Monitoring priorities
   - Alert threshold adjustments

5. **UNCERTAINTY ANALYSIS**
   - Factors that could affect predictions
   - Confidence intervals
   - Risk factors to monitor

Format as structured JSON with clear probability scores and actionable recommendations. Use security industry best practices and cite relevant threat intelligence patterns.`;

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
            temperature: 0.1, // Low temperature for more consistent predictions
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3072,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const predictionText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Prediction failed";

    // Try to parse as JSON, fallback to structured text
    let predictions;
    try {
      predictions = JSON.parse(predictionText);
    } catch {
      predictions = {
        threatPredictions: predictionText,
        riskAssessment: "Analysis provided in text format",
        predictiveInsights: "See threat predictions for details",
        preventiveRecommendations: "Manual review recommended",
        uncertaintyAnalysis: "See threat predictions for details"
      };
    }

    return NextResponse.json({
      success: true,
      predictions,
      metadata: {
        predictionHorizon,
        historicalIncidents: detections.length,
        generatedAt: new Date().toISOString(),
        model: "gemini-1.5-flash",
        confidence: "High" // Based on Gemini's analysis capabilities
      }
    });

  } catch (error) {
    console.error('Gemini threat prediction error:', error);
    return NextResponse.json({ 
      error: "Failed to generate threat predictions with Gemini",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
