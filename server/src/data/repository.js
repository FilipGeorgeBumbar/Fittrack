import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const logAction = async (userId, action, entity) => {
  if (!userId) return;
  
  await prisma.auditLog.create({
    data: { userId, action, entity }
  });

  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentLogs = await prisma.auditLog.count({
    where: {
      userId,
      action,
      timestamp: { gte: oneMinuteAgo }
    }
  });

  if (recentLogs >= 5) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (user && user.role?.name !== 'Admin') {
      await prisma.user.update({
        where: { id: userId },
        data: { isSuspicious: true }
      });
      console.warn(`[GOLD CHALLENGE] User ${userId} flagged as suspicious due to ${action} spam!`);
    }
  }
};

export const getSuspiciousUsers = async () => {
  return prisma.user.findMany({ where: { isSuspicious: true } });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({ include: { role: true }, orderBy: { name: 'asc' } });
};

export const getAuditLogs = async (limit = 50) => {
  return prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit
  });
};

export const getAllWorkouts = async (offset = 0, limit = 10, filter = {}, sort = { field: 'date', order: 'desc' }, userId = null) => {
  const where = {};
  if (filter.type && filter.type !== 'All') where.type = filter.type;
  if (filter.status && filter.status !== 'All') where.status = filter.status;
  if (userId) where.userId = userId;

  const orderBy = {};
  if (sort.field) orderBy[sort.field] = sort.order;

  const results = await prisma.workout.findMany({
    skip: offset,
    take: limit,
    where,
    orderBy,
  });
  
  const total = await prisma.workout.count({ where });

  return { results, total };
};

export const getWorkoutById = async (id, userId = null) => {
  const where = { id };
  if (userId) where.userId = userId;
  return prisma.workout.findFirst({
    where,
    include: { exercises: true },
  });
};

export const createWorkout = async (workout, userId) => {
  const data = {
    ...workout,
    userId,
    date: workout.date || new Date().toISOString()
  };
  const res = await prisma.workout.create({ data });
  await logAction(userId, 'CREATE', 'Workout');
  return res;
};

export const updateWorkout = async (id, updatedFields, userId) => {
  try {
    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing || (userId && existing.userId && existing.userId !== userId)) return null;

    const res = await prisma.workout.update({
      where: { id },
      data: updatedFields,
    });
    await logAction(userId, 'UPDATE', 'Workout');
    return res;
  } catch (e) {
    return null;
  }
};

export const deleteWorkout = async (id, userId) => {
  try {
    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing || (userId && existing.userId && existing.userId !== userId)) return false;

    await prisma.workout.delete({ where: { id } });
    await logAction(userId, 'DELETE', 'Workout');
    return true;
  } catch (e) {
    return false;
  }
};

export const getExercisesForWorkout = async (workoutId) => {
  return prisma.exercise.findMany({ where: { workoutId } });
};

export const createExercise = async (exercise, userId) => {
  const res = await prisma.exercise.create({ data: exercise });
  await logAction(userId, 'CREATE', 'Exercise');
  return res;
};

export const updateExercise = async (id, updatedFields, userId) => {
  const res = await prisma.exercise.update({
    where: { id },
    data: updatedFields,
  });
  await logAction(userId, 'UPDATE', 'Exercise');
  return res;
};

export const deleteExercise = async (id, userId) => {
  try {
    await prisma.exercise.delete({ where: { id } });
    await logAction(userId, 'DELETE', 'Exercise');
    return true;
  } catch (e) {
    return false;
  }
};

export const getStats = async (userId = null) => {
  const where = userId ? { userId } : {};
  const aggregate = await prisma.workout.aggregate({
    where,
    _count: { id: true },
    _sum: { duration: true }
  });
  return { 
    totalWorkouts: aggregate._count.id, 
    totalDuration: aggregate._sum.duration || 0 
  };
};

export const clearAllWorkouts = async () => {
  await prisma.exercise.deleteMany();
  await prisma.workout.deleteMany();
};

export const addWorkoutsBulk = async (newWorkouts) => {
  await prisma.workout.createMany({
    data: newWorkouts.map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      date: w.date,
      duration: w.duration,
      status: w.status,
      notes: w.notes
    }))
  });
};
