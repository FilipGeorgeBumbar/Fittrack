import express from 'express';
import { z } from 'zod';
import * as repo from '../data/repository.js';
import { emitNewWorkouts } from '../socket.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);


// Validation Schemas
const createWorkoutSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(3).max(100),
  duration: z.number().positive(),
  type: z.string().optional(),
  status: z.enum(['Planned', 'Completed']).optional(),
  exercises: z.array(z.string()).optional(),
  notes: z.string().max(300).optional(),
  date: z.string().optional()
});

const updateWorkoutSchema = createWorkoutSchema.partial();

// GET /workouts - with pagination
router.get('/', async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.auth?.role === 'Admin' ? null : req.auth.sub;
  
  const results = await repo.getAllWorkouts(offset, limit, {}, { field: 'date', order: 'desc' }, userId);
  res.json(results);
});

// GET /workouts/stats
router.get('/stats', async (req, res) => {
    const userId = req.auth?.role === 'Admin' ? null : req.auth.sub;
    const stats = await repo.getStats(userId);
    res.json(stats);
});

// GET /workouts/:id
router.get('/:id', async (req, res) => {
  const userId = req.auth?.role === 'Admin' ? null : req.auth.sub;
  const workout = await repo.getWorkoutById(req.params.id, userId);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  res.json(workout);
});

// POST /workouts
router.post('/', async (req, res) => {
  try {
    const validatedData = createWorkoutSchema.parse(req.body);
    const newWorkout = await repo.createWorkout(validatedData, req.auth.sub);
    
    // Server validation success & creation
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(400).json({ error: error.issues || error.message });
  }
});

// PUT /workouts/:id
router.put('/:id', async (req, res) => {
  try {
    const validatedData = updateWorkoutSchema.parse(req.body);
    const userId = req.auth?.role === 'Admin' ? null : req.auth.sub;
    const updatedWorkout = await repo.updateWorkout(req.params.id, validatedData, userId);
    
    if (!updatedWorkout) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }
    
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ error: error.issues || error.message });
  }
});

// DELETE /workouts/:id
router.delete('/:id', async (req, res) => {
  const userId = req.auth?.role === 'Admin' ? null : req.auth.sub;
  const success = await repo.deleteWorkout(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Workout not found or unauthorized' });
  }
  
  res.status(204).send();
});

export default router;
