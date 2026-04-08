/**
 * Stroke Prediction History Page
 * View all previous stroke risk assessments
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { History, TrendingUp, Calendar, Trash2 } from 'lucide-react';

interface StrokePrediction {
  id: string;
  age: number;
  gender: string;
  hypertension: boolean;
  heartDisease: boolean;
  bmi: number;
  avgGlucoseLevel: number;
  smokingStatus: string;
  prediction: number;
  probability: number;
  confidence: number;
  riskLevel: string;
  riskColor: string;
  createdAt: string;
  notes: string | null;
}

export default function StrokeHistory() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<StrokePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stroke/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 }
      });

      setPredictions(response.data.predictions);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load prediction history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prediction?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/stroke/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPredictions(predictions.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting prediction:', err);
      alert('Failed to delete prediction');
    }
  };

  const getRiskBadge = (riskLevel: string, riskColor: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[riskColor] || 'bg-gray-100 text-gray-800'}`}>
        {riskLevel}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <History className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prediction History</h1>
                <p className="text-sm text-gray-500">
                  {predictions.length} total assessment{predictions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/stroke-assessment')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              New Assessment
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {predictions.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Yet</h2>
            <p className="text-gray-600 mb-6">Start by creating your first stroke risk assessment</p>
            <button
              onClick={() => navigate('/stroke-assessment')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Create Assessment
            </button>
          </div>
        )}

        {/* Predictions List */}
        {predictions.length > 0 && (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header Row */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(prediction.createdAt)}</span>
                      </div>
                      {getRiskBadge(prediction.riskLevel, prediction.riskColor)}
                      <span className="text-sm text-gray-600">
                        {(prediction.probability * 100).toFixed(1)}% risk
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Age / Gender</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {prediction.age} yrs / {prediction.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">BMI</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {prediction.bmi.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Glucose</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {prediction.avgGlucoseLevel.toFixed(0)} mg/dL
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Smoking</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {prediction.smokingStatus}
                        </p>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="flex flex-wrap gap-2">
                      {prediction.hypertension && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          Hypertension
                        </span>
                      )}
                      {prediction.heartDisease && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          Heart Disease
                        </span>
                      )}
                      {!prediction.hypertension && !prediction.heartDisease && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          No major conditions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleDelete(prediction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Summary */}
        {predictions.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Summary Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold mb-1">Total Assessments</p>
                <p className="text-2xl font-bold text-blue-900">{predictions.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-semibold mb-1">Low Risk</p>
                <p className="text-2xl font-bold text-green-900">
                  {predictions.filter(p => p.riskLevel === 'Low').length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-600 font-semibold mb-1">Moderate Risk</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {predictions.filter(p => p.riskLevel === 'Moderate').length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-semibold mb-1">High Risk</p>
                <p className="text-2xl font-bold text-red-900">
                  {predictions.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Very High').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
