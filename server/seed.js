import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const count = await prisma.workout.count();
  if (count > 0) {
    console.log('Database already has workouts. Skipping seed.');
    return;
  }

  // Clear old ones maybe? No, just add more
  await prisma.workout.create({ data: { name: 'Morning Jog', type: 'Cardio', date: new Date().toISOString().split('T')[0], duration: 45, status: 'Completed', notes: 'Felt great' } });
  await prisma.workout.create({ data: { name: 'Heavy Lifts', type: 'Strength', date: new Date().toISOString().split('T')[0], duration: 60, status: 'Completed', notes: 'New PR on Bench' } });
  await prisma.workout.create({ data: { name: 'Yoga Session', type: 'Flexibility', date: new Date().toISOString().split('T')[0], duration: 30, status: 'Planned', notes: 'Relaxing' } });
  await prisma.workout.create({ data: { name: 'HIIT Sprints', type: 'Cardio', date: new Date().toISOString().split('T')[0], duration: 20, status: 'Planned', notes: 'Intense 30s ON / 30s OFF' } });
  await prisma.workout.create({ data: { name: 'Core Crusher', type: 'Strength', date: new Date().toISOString().split('T')[0], duration: 15, status: 'Completed', notes: 'No weights' } });
  await prisma.workout.create({ data: { name: 'Evening Walk', type: 'Cardio', date: new Date().toISOString().split('T')[0], duration: 50, status: 'Completed', notes: 'Easy pace' } });
  
  console.log('Successfully seeded 6 workouts!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
