import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';

const router = Router();

// Get all alerts for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { dismissed } = req.query;

    const where: any = { userId };
    if (dismissed !== undefined) {
      where.dismissed = dismissed === 'true';
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert statistics
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [totalAlerts, activeAlerts, criticalAlerts] = await Promise.all([
      prisma.alert.count({ where: { userId } }),
      prisma.alert.count({ where: { userId, dismissed: false } }),
      prisma.alert.count({
        where: { userId, alertType: 'CRITICAL', dismissed: false },
      }),
    ]);

    res.json({
      total: totalAlerts,
      active: activeAlerts,
      critical: criticalAlerts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert stats' });
  }
});

// Dismiss alert
router.put('/:id/dismiss', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const alert = await prisma.alert.findFirst({
      where: { id, userId },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        dismissed: true,
        dismissedAt: new Date(),
      },
    });

    res.json({ message: 'Alert dismissed', alert: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss alert' });
  }
});

// Get/Update alert settings
router.get('/settings', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    let settings = await prisma.alertSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.alertSettings.create({
        data: { userId },
      });
    }

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      minBpm,
      maxBpm,
      criticalMinBpm,
      criticalMaxBpm,
      emailEnabled,
      smsEnabled,
      pushEnabled,
    } = req.body;

    const settings = await prisma.alertSettings.upsert({
      where: { userId },
      update: {
        minBpm,
        maxBpm,
        criticalMinBpm,
        criticalMaxBpm,
        emailEnabled,
        smsEnabled,
        pushEnabled,
      },
      create: {
        userId,
        minBpm,
        maxBpm,
        criticalMinBpm,
        criticalMaxBpm,
        emailEnabled,
        smsEnabled,
        pushEnabled,
      },
    });

    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
