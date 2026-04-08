import axios from 'axios';

interface HealthData {
  age: number;
  gender: string;
  hypertension: boolean;
  heartDisease: boolean;
  bmi: number;
  avgGlucoseLevel: number;
  smokingStatus: string;
}

interface PredictionResult {
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  recommendation: string;
  factors: string[];
}

export const predictStrokeRisk = async (data: HealthData): Promise<PredictionResult> => {
  try {
    // Try to call Python ML API if available
    if (process.env.ML_API_URL) {
      const response = await axios.post(`${process.env.ML_API_URL}/predict`, data, {
        timeout: 5000,
      });
      return response.data;
    }

    // Fallback: Rule-based prediction (simple heuristic)
    return ruleBasedPrediction(data);
  } catch (error) {
    console.warn('ML API not available, using rule-based prediction');
    return ruleBasedPrediction(data);
  }
};

// Simple rule-based stroke risk assessment (fallback)
const ruleBasedPrediction = (data: HealthData): PredictionResult => {
  let score = 0;
  const factors: string[] = [];

  // Age risk (biggest factor)
  if (data.age > 65) {
    score += 0.30;
    factors.push(`Age over 65 (${data.age} years)`);
  } else if (data.age > 55) {
    score += 0.15;
    factors.push(`Age over 55 (${data.age} years)`);
  } else if (data.age > 45) {
    score += 0.05;
  }

  // Hypertension
  if (data.hypertension) {
    score += 0.25;
    factors.push('Hypertension present');
  }

  // Heart disease
  if (data.heartDisease) {
    score += 0.25;
    factors.push('Heart disease present');
  }

  // BMI
  if (data.bmi > 30) {
    score += 0.10;
    factors.push(`High BMI (${data.bmi.toFixed(1)})`);
  } else if (data.bmi > 25) {
    score += 0.05;
  }

  // Glucose level
  if (data.avgGlucoseLevel > 140) {
    score += 0.10;
    factors.push(`Elevated glucose (${data.avgGlucoseLevel.toFixed(1)} mg/dL)`);
  } else if (data.avgGlucoseLevel > 120) {
    score += 0.05;
  }

  // Smoking status
  if (data.smokingStatus === 'current') {
    score += 0.15;
    factors.push('Current smoker');
  } else if (data.smokingStatus === 'formerly') {
    score += 0.05;
    factors.push('Former smoker');
  }

  // Cap at 1.0
  score = Math.min(score, 1.0);

  // Determine risk level
  let riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  let recommendation: string;

  if (score < 0.15) {
    riskLevel = 'low';
    recommendation = 'Maintain healthy lifestyle habits. Regular check-ups recommended.';
  } else if (score < 0.35) {
    riskLevel = 'moderate';
    recommendation = 'Monitor cardiovascular health closely. Consider lifestyle modifications.';
  } else if (score < 0.60) {
    riskLevel = 'high';
    recommendation = 'Consult with a cardiologist. Lifestyle changes and medication may be needed.';
  } else {
    riskLevel = 'very-high';
    recommendation = 'Immediate medical attention recommended. High stroke risk detected.';
  }

  if (factors.length === 0) {
    factors.push('No major risk factors detected');
  }

  return {
    riskScore: parseFloat(score.toFixed(3)),
    riskLevel,
    recommendation,
    factors,
  };
};
