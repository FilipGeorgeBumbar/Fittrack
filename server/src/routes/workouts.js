import express from 'express';
import { z } from 'zod';
import * as repo from '../data/repository.js';
import { emitNewWorkouts } from '../socket.js';

const router = express.Router();

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
  
  const results = await repo.getAllWorkouts(offset, limit);
  res.json(results);
});

// GET /workouts/stats
router.get('/stats', async (req, res) => {
    const stats = await repo.getStats();
    res.json(stats);
});

// GET /workouts/:id
router.get('/:id', async (req, res) => {
  const workout = await repo.getWorkoutById(req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  res.json(workout);
});

// POST /workouts
router.post('/', async (req, res) => {
  try {
    const validatedData = createWorkoutSchema.parse(req.body);
    const newWorkout = await repo.createWorkout(validatedData);
    
    // Server validation success & creation
    res.status(201).json(newWorkout);
    
    // Potentially notify via sockets even for manual creations? 
    // Requirements mention web socket for faker-generated ones, but we can do it here too if needed, or keep them separate.
    // emitNewWorkouts([newWorkout]); // Uncomment if we want ALL creations to emit.
  } catch (error) {
    res.status(400).json({ error: error.issues || error.message });
  }
});

// PUT /workouts/:id
router.put('/:id', async (req, res) => {
  try {
    const validatedData = updateWorkoutSchema.parse(req.body);
    const updatedWorkout = await repo.updateWorkout(req.params.id, validatedData);
    
    if (!updatedWorkout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ error: error.issues || error.message });
  }
});

// DELETE /workouts/:id
router.delete('/:id', async (req, res) => {
  const success = await repo.deleteWorkout(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  
  res.status(204).send();
});

export default router;
