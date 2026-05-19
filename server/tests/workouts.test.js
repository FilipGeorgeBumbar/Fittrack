import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import * as repo from '../src/data/repository.js';

describe('Workouts API', () => {
  beforeEach(async () => {
    // Reset data before each test
    await repo.clearAllWorkouts();
    await repo.createWorkout({ name: 'Test Workout 1', duration: 30, status: 'Completed' });
    await repo.createWorkout({ name: 'Test Workout 2', duration: 45, status: 'Planned' });
  });

  describe('GET /workouts', () => {
    it('should return paginated list of workouts', async () => {
      const res = await request(app).get('/workouts?offset=0&limit=1');
      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });
  });

  describe('GET /workouts/:id', () => {
    it('should return a specific workout', async () => {
      const data = await repo.getAllWorkouts(0, 10);
      const target = data.results[0];
      
      const res = await request(app).get(`/workouts/${target.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(target.id);
      expect(res.body.name).toBe(target.name);
    });

    it('should return 404 for non-existent workout', async () => {
      const res = await request(app).get('/workouts/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /workouts', () => {
    it('should create a new workout with valid data', async () => {
      const newWorkout = {
        name: 'New Running',
        duration: 60,
        status: 'Completed'
      };
      
      const res = await request(app).post('/workouts').send(newWorkout);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newWorkout.name);
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidWorkout = {
        name: 'A', // Too short
        duration: -10, // Invalid
        status: 'Completed'
      };
      
      const res = await request(app).post('/workouts').send(invalidWorkout);
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /workouts/:id', () => {
    it('should update an existing workout', async () => {
      const data = await repo.getAllWorkouts(0, 10);
      const target = data.results[0];
      
      const res = await request(app)
        .put(`/workouts/${target.id}`)
        .send({ duration: 100 });
        
      expect(res.status).toBe(200);
      expect(res.body.duration).toBe(100);
      expect(res.body.name).toBe(target.name); // Unchanged
    });

    it('should return 404 if updating non-existent workout', async () => {
      const res = await request(app).put('/workouts/nonexistent').send({ duration: 100 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /workouts/:id', () => {
    it('should delete an existing workout', async () => {
      const data = await repo.getAllWorkouts(0, 10);
      const target = data.results[0];
      
      const res = await request(app).delete(`/workouts/${target.id}`);
      expect(res.status).toBe(204);
      
      const checkRes = await request(app).get(`/workouts/${target.id}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 for non-existent workout', async () => {
      const res = await request(app).delete('/workouts/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /workouts/stats', () => {
      it('should return valid statistics', async () => {
          const res = await request(app).get('/workouts/stats');
          expect(res.status).toBe(200);
          expect(res.body.totalWorkouts).toBe(2);
          expect(res.body.totalDuration).toBe(75); // 30 + 45
      });
  });
});
