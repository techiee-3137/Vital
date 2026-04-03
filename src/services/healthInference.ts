import { GoogleGenAI } from "@google/genai";
import { HealthDataPoint, HealthBaseline, InferenceResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHealthInference(
  currentData: HealthDataPoint,
  baseline: HealthBaseline
): Promise<InferenceResult> {
  // Calculate variance score based on SEM
  // If current HRV is more than 2 SEM away from mean, it's a variance
  const hrvDiff = Math.abs(currentData.hrv - baseline.meanHRV);
  const varianceScore = baseline.semHRV > 0 ? hrvDiff / baseline.semHRV : 0;

  const prompt = `
    Analyze the following health data for a user.
    
    Current Vitals:
    - Heart Rate: ${currentData.heartRate} BPM
    - HRV (RMSSD): ${currentData.hrv} ms
    - Stress Level: ${currentData.stressLevel}/100
    
    Baseline Metrics (30-day average):
    - Mean HRV: ${baseline.meanHRV} ms
    - Standard Error of Mean (SEM): ${baseline.semHRV} ms
    - Variance Score (Current Deviation / SEM): ${varianceScore.toFixed(2)}
    
    Provide a clinical-grade inference. 
    If variance score > 3, it's a significant anomaly (Potential acute event).
    If variance score > 1.5, it's a warning (Physiological stress).
    
    Return the result in JSON format:
    {
      "status": "normal" | "warning" | "critical",
      "message": "Short summary of the state",
      "recommendation": "Actionable advice",
      "varianceScore": ${varianceScore}
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      status: result.status || 'normal',
      message: result.message || 'Baseline established.',
      recommendation: result.recommendation || 'Continue monitoring.',
      varianceScore: varianceScore
    };
  } catch (error) {
    console.error("Inference Error:", error);
    return {
      status: 'normal',
      message: 'Processing inference...',
      recommendation: 'Stand by for analysis.',
      varianceScore: varianceScore
    };
  }
}

// Mock baseline generator
export function generateMockBaseline(): HealthBaseline {
  return {
    meanHR: 72,
    meanHRV: 45,
    stdDevHRV: 8,
    semHRV: 1.5,
  };
}
