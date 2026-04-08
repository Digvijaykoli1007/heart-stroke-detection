/**
 * Stroke Prediction API Routes
 * Handles stroke risk assessment and prediction history
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

// ML API Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

/**
 * POST /api/stroke/predict
 * Predict stroke risk for a patient
 */
router.post('/predict', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      age,
      gender,
      hypertension,
      heart_disease,
      ever_married,
      work_type,
      Residence_type,
      avg_glucose_level,
      bmi,
      smoking_status,
      notes
    } = req.body;

    // Validate required fields
    if (!age || !gender || hypertension === undefined || heart_disease === undefined ||
        !ever_married || !work_type || !Residence_type || !avg_glucose_level || !bmi || !smoking_status) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['age', 'gender', 'hypertension', 'heart_disease', 'ever_married', 
                   'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status']
      });
      return;
    }

    // Call ML API
    const mlResponse = await axios.post(`${ML_API_URL}/api/predict`, {
      age: Number(age),
      gender,
      hypertension: Number(hypertension),
      heart_disease: Number(heart_disease),
      ever_married,
      work_type,
      Residence_type,
      avg_glucose_level: Number(avg_glucose_level),
      bmi: Number(bmi),
      smoking_status
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60 second timeout (ML model loading can be slow)
    });

    const prediction = mlResponse.data.prediction;

    // Save prediction to database
    const savedPrediction = await prisma.strokePrediction.create({
      data: {
        userId,
        age: Number(age),
        gender,
        hypertension: Boolean(Number(hypertension)),
        heartDisease: Boolean(Number(heart_disease)),
        everMarried: ever_married,
        workType: work_type,
        residenceType: Residence_type,
        avgGlucoseLevel: Number(avg_glucose_level),
        bmi: Number(bmi),
        smokingStatus: smoking_status,
        prediction: prediction.stroke_risk,
        probability: prediction.probability / 100, // Convert percentage back to 0-1
        confidence: prediction.confidence / 100,
        riskLevel: prediction.risk_level,
        riskColor: prediction.risk_color,
        notes: notes || null
      }
    });

    // Update user's health profile
    await prisma.healthProfile.upsert({
      where: { userId },
      create: {
        userId,
        age: Number(age),
        gender,
        hypertension: Boolean(Number(hypertension)),
        heartDisease: Boolean(Number(heart_disease)),
        bmi: Number(bmi),
        avgGlucoseLevel: Number(avg_glucose_level),
        smokingStatus: smoking_status,
        strokeRiskScore: prediction.probability / 100,
        lastAssessment: new Date()
      },
      update: {
        age: Number(age),
        gender,
        hypertension: Boolean(Number(hypertension)),
        heartDisease: Boolean(Number(heart_disease)),
        bmi: Number(bmi),
        avgGlucoseLevel: Number(avg_glucose_level),
        smokingStatus: smoking_status,
        strokeRiskScore: prediction.probability / 100,
        lastAssessment: new Date()
      }
    });

    res.json({
      success: true,
      predictionId: savedPrediction.id,
      result: mlResponse.data
    });

  } catch (error: any) {
    console.error('❌ Stroke prediction error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'ML prediction service unavailable',
        message: 'Please ensure the ML API is running on port 5001'
      });
    } else if (error.response) {
      res.status(error.response.status).json({
        error: 'ML prediction failed',
        message: error.response.data.error || 'Unknown error'
      });
    } else {
      res.status(500).json({
        error: 'Prediction failed',
        message: error.message
      });
    }
  }
});

/**
 * GET /api/stroke/history
 * Get stroke prediction history for current user
 */
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = '10', offset = '0' } = req.query;

    const predictions = await prisma.strokePrediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.strokePrediction.count({
      where: { userId }
    });

    res.json({
      success: true,
      predictions,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch prediction history',
      message: error.message
    });
  }
});

/**
 * GET /api/stroke/history/:id
 * Get specific prediction by ID
 */
router.get('/history/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const prediction = await prisma.strokePrediction.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!prediction) {
      res.status(404).json({
        error: 'Prediction not found'
      });
      return;
    }

    res.json({
      success: true,
      prediction
    });

  } catch (error: any) {
    console.error('❌ Error fetching prediction:', error);
    res.status(500).json({
      error: 'Failed to fetch prediction',
      message: error.message
    });
  }
});

/**
 * DELETE /api/stroke/history/:id
 * Delete a prediction record
 */
router.delete('/history/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if prediction exists and belongs to user
    const prediction = await prisma.strokePrediction.findFirst({
      where: { id, userId }
    });

    if (!prediction) {
      res.status(404).json({
        error: 'Prediction not found'
      });
      return;
    }

    await prisma.strokePrediction.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Prediction deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting prediction:', error);
    res.status(500).json({
      error: 'Failed to delete prediction',
      message: error.message
    });
  }
});

/**
 * GET /api/stroke/analytics
 * Get aggregated stroke prediction analytics
 */
router.get('/analytics', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all predictions for analytics
    const predictions = await prisma.strokePrediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (predictions.length === 0) {
      res.json({
        success: true,
        analytics: {
          totalPredictions: 0,
          latestRiskLevel: null,
          riskTrend: [],
          riskDistribution: {
            Low: 0,
            Moderate: 0,
            High: 0,
            'Very High': 0
          }
        }
      });
      return;
    }

    // Calculate analytics
    const riskDistribution = predictions.reduce((acc: Record<string, number>, p: { riskLevel: string }) => {
      acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const latestPrediction = predictions[0];
    const avgProbability = predictions.reduce((sum: number, p: { probability: number }) => sum + p.probability, 0) / predictions.length;

    // Risk trend (last 10 predictions)
    const riskTrend = predictions.slice(0, 10).reverse().map((p: { createdAt: Date; probability: number; riskLevel: string }) => ({
      date: p.createdAt,
      probability: p.probability * 100,
      riskLevel: p.riskLevel
    }));

    res.json({
      success: true,
      analytics: {
        totalPredictions: predictions.length,
        latestRiskLevel: latestPrediction.riskLevel,
        latestProbability: latestPrediction.probability * 100,
        avgProbability: avgProbability * 100,
        riskTrend,
        riskDistribution: {
          Low: riskDistribution['Low'] || 0,
          Moderate: riskDistribution['Moderate'] || 0,
          High: riskDistribution['High'] || 0,
          'Very High': riskDistribution['Very High'] || 0
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating analytics:', error);
    res.status(500).json({
      error: 'Failed to generate analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/stroke/ml-status
 * Check if ML API is available
 */
router.get('/ml-status', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ML_API_URL}/api/health`, { timeout: 3000 });
    res.json({
      available: true,
      status: response.data
    });
  } catch (error) {
    res.json({
      available: false,
      error: 'ML API not reachable'
    });
  }
});

export default router;
