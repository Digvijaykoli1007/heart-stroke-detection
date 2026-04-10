/**
 * Stroke Risk Assessment Page
 * Medical intake form for stroke prediction
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Activity, HardDrive } from 'lucide-react';
import { fetchLatestVitals } from '../services/firebaseApi';
import { fetchStrokeRisk, PatientData } from '../services/mlApi';

export default function StrokeAssessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  
  // To display real-time vitals
  const [vitals, setVitals] = useState<{heartRate: number, spo2: number} | null>(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    hypertension: '0',
    heart_disease: '0',
    weight: '',
    height: ''
  });

  useEffect(() => {
    // Poll for vitals so the user knows what hardware data is going into the model
    const fetchVitals = async () => {
      const latest = await fetchLatestVitals();
      if (latest) {
        setVitals(latest);
      }
    };
    fetchVitals();
    const interval = setInterval(fetchVitals, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!vitals) {
        throw new Error("Hardware vitals pending. Please ensure the ESP32 is sending data to Firebase.");
      }

      const patientData: PatientData = {
        age: Number(formData.age),
        gender: formData.gender,
        hypertension: Number(formData.hypertension),
        heart_disease: Number(formData.heart_disease),
        weight: Number(formData.weight),
        height: Number(formData.height),
        heartRate: vitals.heartRate,
        spo2: vitals.spo2
      };

      const risk = await fetchStrokeRisk(patientData);
      
      if (risk === "--" || risk == null) {
        throw new Error("Failed to reach ML API. Make sure the Python FAST API server is running on port 8000.");
      }

      setResult(risk as number);
      setStep('result');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 15) return 'bg-green-50 border-green-200 text-green-800';
    if (risk < 50) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (risk < 75) return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-red-50 border-red-200 text-red-800';
  };
  
  const getRiskLabel = (risk: number) => {
    if (risk < 15) return 'Low';
    if (risk < 50) return 'Moderate';
    if (risk < 75) return 'High';
    return 'Critical';
  };

  const getSuggestions = (risk: number) => {
    if (risk < 15) {
      return [
        "Maintain a healthy diet rich in fruits, vegetables, and whole grains.",
        "Engage in regular physical activity (e.g., 150 minutes of moderate exercise per week).",
        "Keep up with routine medical check-ups."
      ];
    }
    if (risk < 50) {
      return [
        "Monitor your blood pressure and cholesterol levels regularly.",
        "Consider consulting a nutritionist for a heart-healthy diet plan.",
        "Reduce sodium intake and avoid smoking to lower your risk further.",
        "Incorporate stress-reduction techniques like meditation or yoga."
      ];
    }
    if (risk < 75) {
      return [
        "Schedule a follow-up appointment with a cardiologist soon.",
        "Strictly adhere to any prescribed medications for blood pressure or cholesterol.",
        "Begin a medically supervised exercise program.",
        "Monitor your heart rate and SpO2 levels daily using your home monitoring setup."
      ];
    }
    return [
      "Seek immediate medical consultation to evaluate your cardiovascular health.",
      "Do not ignore symptoms like sudden numbness, confusion, or severe headache.",
      "Work with your doctor on a strict medication and lifestyle management plan.",
      "Consider a thorough diagnostic review, including an ECG and blood panels."
    ];
  };

  const currentRiskColor = result !== null ? getRiskColor(result) : '';
  const currentRiskLabel = result !== null ? getRiskLabel(result) : '';

  const resetForm = () => {
    setStep('form');
    setResult(null);
    setError('');
    setFormData({
      age: '',
      gender: 'Male',
      hypertension: '0',
      heart_disease: '0',
      weight: '',
      height: ''
    });
  };

  if (step === 'result' && result !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stroke Risk Assessment</h1>
                  <p className="text-sm text-gray-500">AI-Powered Prediction Result</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                New Assessment
              </button>
            </div>
          </div>

          {/* Risk Score Card */}
          <div className={`rounded-xl border-2 p-8 mb-6 ${currentRiskColor}`}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-4">
                <span className="text-3xl font-bold">{result.toFixed(1)}%</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">{currentRiskLabel} Risk</h2>
              <p className="text-lg mb-4">Calculated based on clinical history and real-time biometric sensors.</p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center gap-2">
                   <HardDrive className="w-4 h-4" />
                   <span>Real-time HR: {vitals?.heartRate} BPM</span>
                </div>
                <div className="flex items-center gap-2">
                   <HardDrive className="w-4 h-4" />
                   <span>Real-time SpO2: {vitals?.spo2}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Care Suggestions */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Health Care Plan</h3>
            <ul className="space-y-3">
              {getSuggestions(result).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 bg-indigo-50 p-1.5 rounded-full ring-1 ring-indigo-200">
                     <Activity className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 leading-relaxed font-medium">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Print Report
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                New Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stroke Risk Assessment</h1>
              <p className="text-sm text-gray-500">AI-Powered Clinical Intelligence via Real-Time Sensors</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
            <div className="flex items-start space-x-2">
              <HardDrive className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Hardware Status</p>
                <p>Sensor Data Link: {vitals ? 'Active' : 'Waiting for ESP32...'}</p>
              </div>
            </div>
            {vitals && (
               <div className="text-right">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold mr-2">HR: {vitals.heartRate}</span>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">SpO2: {vitals.spo2}%</span>
               </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Patient Information</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years) *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 45"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Hypertension */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hypertension (High Blood Pressure) *
              </label>
              <select
                name="hypertension"
                value={formData.hypertension}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            {/* Heart Disease */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heart Disease *
              </label>
              <select
                name="heart_disease"
                value={formData.heart_disease}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                required
                min="10"
                max="300"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 70"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm) *
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                required
                min="50"
                max="250"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 170"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || !vitals}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>Analyzing Risk...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>{vitals ? 'Predict Stroke Risk' : 'Waiting for Hardware...'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
