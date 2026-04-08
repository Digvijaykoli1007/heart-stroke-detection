import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { predictStrokeRisk } from '../services/ml.service';

const router = Router();

// Validation schema
const healthProfileSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other']),
  hypertension: z.boolean(),
  heartDisease: z.boolean(),
  bmi: z.number().min(10).max(60).optional(),
  avgGlucoseLevel: z.number().min(50).max(300).optional(),
  smokingStatus: z.enum(['never', 'formerly', 'current', 'unknown']).optional(),
});

// Get health profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    let profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health profile' });
  }
});

// Create/Update health profile
router.post('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = healthProfileSchema.parse(req.body);

    const profile = await prisma.healthProfile.upsert({
      where: { userId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...data,
      },
    });

    res.json({
      message: 'Health profile saved',
      profile,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to save health profile' });
  }
});

// Assess stroke risk (ML prediction)
router.post('/assess-risk', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get health profile
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(400).json({
        error: 'Please complete your health profile first',
      });
    }

    // Predict stroke risk using ML model
    const prediction = await predictStrokeRisk({
      age: profile.age,
      gender: profile.gender,
      hypertension: profile.hypertension,
      heartDisease: profile.heartDisease,
      bmi: profile.bmi || 25.0,
      avgGlucoseLevel: profile.avgGlucoseLevel|| 100.0,
      smokingStatus: profile.smokingStatus || 'unknown',
    });

    // Update profile with risk score
    const updated = await prisma.healthProfile.update({
      where: { userId },
      data: {
        strokeRiskScore: prediction.riskScore,
        lastAssessment: new Date(),
      },
    });

    res.json({
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      recommendation: prediction.recommendation,
      factors: prediction.factors,
      profile: updated,
    });
  } catch (error: any) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to assess stroke risk' });
  }
});

export default router;
