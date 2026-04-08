import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';

const router = Router();

// Get all patients (for doctors/admins)
router.get('/', authenticate, authorize('DOCTOR', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const patients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            heartbeatRecords: true,
            alerts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ patients, count: patients.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check access permissions
    if (currentUser.role === 'PATIENT' && currentUser.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        healthProfile: true,
        alertSettings: true,
        _count: {
          select: {
            heartbeatRecords: true,
            alerts: true,
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get latest heartbeat
    const latestHeartbeat = await prisma.heartbeatRecord.findFirst({
      where: { userId: id },
      orderBy: { timestamp: 'desc' },
    });

    // Get active alerts
    const activeAlerts = await prisma.alert.findMany({
      where: { userId: id, dismissed: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      patient,
      latestHeartbeat,
      activeAlerts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

// Get patient's monitoring dashboard data
router.get('/:id/dashboard', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check access permissions
    if (currentUser.role === 'PATIENT' && currentUser.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get last 24 hours of data
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [heartbeatRecords, activeAlerts, alertSettings] = await Promise.all([
      prisma.heartbeatRecord.findMany({
        where: {
          userId: id,
          timestamp: { gte: yesterday },
        },
        orderBy: { timestamp: 'asc' },
      }),
      prisma.alert.findMany({
        where: { userId: id, dismissed: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.alertSettings.findUnique({
        where: { userId: id },
      }),
    ]);

    // Calculate analytics
    const bpmValues = heartbeatRecords.map((r: any) => r.bpm);
    const avgBpm = bpmValues.length > 0
      ? Math.round(bpmValues.reduce((a: number, b: number) => a + b, 0) / bpmValues.length)
      : 0;
    const minBpm = bpmValues.length > 0 ? Math.min(...bpmValues) : 0;
    const maxBpm = bpmValues.length > 0 ? Math.max(...bpmValues) : 0;

    res.json({
      timeline: heartbeatRecords,
      analytics: {
        avgBpm,
        minBpm,
        maxBpm,
        recordCount: heartbeatRecords.length,
      },
      activeAlerts,
      alertSettings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
