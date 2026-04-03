export interface HealthDataPoint {
  timestamp: number;
  heartRate: number;
  hrv: number; // RMSSD in ms
  stressLevel: number; // 0-100
}

export interface HealthBaseline {
  meanHR: number;
  meanHRV: number;
  stdDevHRV: number;
  semHRV: number; // Standard Error of the Mean
}

export interface InferenceResult {
  status: 'normal' | 'warning' | 'critical';
  message: string;
  recommendation: string;
  varianceScore: number;
}
