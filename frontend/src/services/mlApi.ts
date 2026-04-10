// src/services/mlApi.ts

const ML_API_URL = import.meta.env.VITE_ML_API_URL || "/api/predict";

export interface PatientData {
  heartRate: number;
  spo2: number;
  gender: string;
  age: number;
  hypertension: number;
  heart_disease: number;
  weight: number;
  height: number;
}

export const fetchStrokeRisk = async (patientData: PatientData): Promise<number | "--"> => {
  try {
    const response = await fetch(ML_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const result = await response.json();
    
    // Returns just the number (e.g., 12.45)
    return result.stroke_risk; 

  } catch (error) {
    console.error("🤖 Error fetching from ML backend:", error);
    return "--"; // Return a placeholder if the Python server isn't running
  }
};
