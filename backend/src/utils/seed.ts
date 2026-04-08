import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const password = await bcrypt.hash('password123', 10);

  // Create doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@cardiomonitor.com' },
    update: {},
    create: {
      email: 'doctor@cardiomonitor.com',
      name: 'Dr. Sarah Chen',
      password,
      role: 'DOCTOR',
    },
  });

  // Create patients
  const patients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@patient.com' },
      update: {},
      create: {
        email: 'john@patient.com',
        name: 'John Anderson',
        password,
        role: 'PATIENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@patient.com' },
      update: {},
      create: {
        email: 'maria@patient.com',
        name: 'Maria Rodriguez',
        password,
        role: 'PATIENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'david@patient.com' },
      update: {},
      create: {
        email: 'david@patient.com',
        name: 'David Kim',
        password,
        role: 'PATIENT',
      },
    }),
  ]);

  console.log(`✓ Created ${patients.length} patients and 1 doctor`);

  // Create health profiles
  for (const patient of patients) {
    await prisma.healthProfile.upsert({
      where: { userId: patient.id },
      update: {},
      create: {
        userId: patient.id,
        age: Math.floor(Math.random() * 40) + 30,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        hypertension: Math.random() > 0.7,
        heartDisease: Math.random() > 0.9,
        bmi: parseFloat((Math.random() * 15 + 20).toFixed(1)),
        avgGlucoseLevel: parseFloat((Math.random() * 100 + 80).toFixed(1)),
        smokingStatus: ['never', 'formerly', 'current'][Math.floor(Math.random() * 3)],
      },
    });
  }

  console.log('✓ Created health profiles');

  // Create sample heartbeat data (last 24 hours)
  const now = new Date();
  for (const patient of patients) {
    const baselineBPM = Math.floor(Math.random() * 20) + 65; // 65-85
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const variation = Math.floor(Math.random() * 20) - 10;
      const bpm = Math.max(50, Math.min(140, baselineBPM + variation));

      await prisma.heartbeatRecord.create({
        data: {
          userId: patient.id,
          bpm,
          timestamp,
          source: 'simulated',
        },
      });
    }
  }

  console.log('✓ Created sample heartbeat records');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📧 Demo Accounts:');
  console.log('Doctor:');
  console.log('  Email: doctor@cardiomonitor.com');
  console.log('  Password: password123');
  console.log('\nPatients:');
  console.log('  Email: john@patient.com');
  console.log('  Email: maria@patient.com');
  console.log('  Email: david@patient.com');
  console.log('  Password (all): password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
