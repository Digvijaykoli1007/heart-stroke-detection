import { prisma } from '../config/database';
import { io } from '../server';

export const checkAndCreateAlert = async (userId: string, bpm: number) => {
  try {
    // Get user's alert settings
    let settings = await prisma.alertSettings.findUnique({
      where: { userId },
    });

    // Create default settings if not exist
    if (!settings) {
      settings = await prisma.alertSettings.create({
        data: { userId },
      });
    }

    let alertType: 'BRADYCARDIA' | 'TACHYCARDIA' | 'CRITICAL' | null = null;
    let message = '';

    // Check for critical levels first
    if (bpm < settings.criticalMinBpm) {
      alertType = 'CRITICAL';
      message = `Critical: Dangerously low heart rate (${bpm} BPM)`;
    } else if (bpm > settings.criticalMaxBpm) {
      alertType = 'CRITICAL';
      message = `Critical: Dangerously high heart rate (${bpm} BPM)`;
    }
    // Check for warning levels
    else if (bpm < settings.minBpm) {
      alertType = 'BRADYCARDIA';
      message = `Warning: Low heart rate detected (${bpm} BPM)`;
    } else if (bpm > settings.maxBpm) {
      alertType = 'TACHYCARDIA';
      message = `Warning: High heart rate detected (${bpm} BPM)`;
    }

    // Create alert if threshold breached
    if (alertType) {
      const alert = await prisma.alert.create({
        data: {
          userId,
          bpmValue: bpm,
          alertType,
          message,
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

      // Emit alert via WebSocket
      io.emit('alert-created', {
        alertId: alert.id,
        userId,
        userName: alert.user.name,
        alertType,
        message,
        bpmValue: bpm,
        timestamp: alert.createdAt,
      });

      // Send email notification if enabled
      if (settings.emailEnabled) {
        // TODO: Implement email service
        console.log(`[Email] Alert for ${alert.user.email}: ${message}`);
      }

      return alert;
    }

    return null;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};
