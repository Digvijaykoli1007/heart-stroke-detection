import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { io } from '../server';
import { checkAndCreateAlert } from '../services/alert.service';

const router = Router();

// Validation schema
const heartbeatSchema = z.object({
  bpm: z.number().min(30).max(250),
  source: z.enum(['manual', 'mobile', 'wearable', 'simulated']).optional(),
  notes: z.string().optional(),
});

// Record heartbeat
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bpm, source, notes } = heartbeatSchema.parse(req.body);
    const userId = req.user!.id;

    // Create heartbeat record
    const record = await prisma.heartbeatRecord.create({
      data: {
        userId,
        bpm,
        source: source || 'manual',
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Check for alerts
    await checkAndCreateAlert(userId, bpm);

    // Emit real-time update via WebSocket
    io.emit('bpm-update', {
      userId,
      bpm,
      timestamp: record.timestamp,
      userName: record.user.name,
    });

    res.status(201).json({
      message: 'Heartbeat recorded successfully',
      record,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to record heartbeat' });
  }
});

// Get user's heartbeat history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { limit = '100', startDate, endDate } = req.query;

    const where: any = { userId };
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const records = await prisma.heartbeatRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({ records, count: records.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get latest heartbeat
router.get('/latest', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const latest = await prisma.heartbeatRecord.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    if (!latest) {
      return res.status(404).json({ error: 'No heartbeat records found' });
    }

    res.json({ record: latest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest heartbeat' });
  }
});

// Get analytics
router.get('/analytics', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { period = '24h' } = req.query;

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const records = await prisma.heartbeatRecord.findMany({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (records.length === 0) {
      return res.json({
        avgBpm: 0,
        minBpm: 0,
        maxBpm: 0,
        recordCount: 0,
        timeline: [],
      });
    }

    const bpmValues = records.map((r: any) => r.bpm);
    const avgBpm = Math.round(bpmValues.reduce((a: number, b: number) => a + b, 0) / bpmValues.length);
    const minBpm = Math.min(...bpmValues);
    const maxBpm = Math.max(...bpmValues);

    res.json({
      avgBpm,
      minBpm,
      maxBpm,
      recordCount: records.length,
      timeline: records.map((r: any) => ({
        timestamp: r.timestamp,
        bpm: r.bpm,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
