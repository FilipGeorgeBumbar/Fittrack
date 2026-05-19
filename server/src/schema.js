import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import * as repo from './data/repository.js';

export const typeDefs = `#graphql
  type Exercise {
    id: ID!
    workoutId: ID!
    name: String!
    sets: Int
    reps: Int
    weight: Float
  }

  type Workout {
    id: ID!
    name: String!
    type: String
    date: String!
    duration: Int!
    status: String!
    notes: String
    exercises: [Exercise!]
  }

  type PaginatedWorkouts {
    results: [Workout!]
    total: Int!
  }

  input WorkoutFilter {
    type: String
    status: String
  }

  input WorkoutSort {
    field: String
    order: String
  }

  type AuditLogEntry {
    id: ID!
    userId: String!
    action: String!
    entity: String!
    timestamp: String!
  }

  type Role {
    id: ID!
    name: String!
  }

  type UserFull {
    id: ID!
    name: String!
    email: String!
    isSuspicious: Boolean!
    role: Role
  }

  type Query {
    getWorkouts(offset: Int, limit: Int, filter: WorkoutFilter, sort: WorkoutSort): PaginatedWorkouts
    getWorkoutById(id: ID!): Workout
    getSuspiciousUsers: [User!]
    getAllUsers: [UserFull!]
    getAuditLogs(limit: Int): [AuditLogEntry!]
  }

  type User {
    id: ID!
    name: String!
    email: String!
    isSuspicious: Boolean!
  }

  input ExerciseInput {
    name: String!
    sets: Int
    reps: Int
    weight: Float
  }

  input WorkoutInput {
    name: String!
    type: String
    date: String
    duration: Int!
    status: String!
    notes: String
  }

  type Mutation {
    addWorkout(workout: WorkoutInput!): Workout
    updateWorkout(id: ID!, workout: WorkoutInput!): Workout
    deleteWorkout(id: ID!): Boolean

    addExercise(workoutId: ID!, exercise: ExerciseInput!): Exercise
    updateExercise(id: ID!, exercise: ExerciseInput!): Exercise
    deleteExercise(id: ID!): Boolean
  }

  type Subscription {
    workoutAdded: Workout
  }
`;

export const resolvers = {
  Query: {
    getWorkouts: (_, { offset = 0, limit = 10, filter, sort }) => repo.getAllWorkouts(offset, limit, filter, sort),
    getWorkoutById: (_, { id }) => repo.getWorkoutById(id),
    getSuspiciousUsers: () => repo.getSuspiciousUsers(),
    getAllUsers: () => repo.getAllUsers(),
    getAuditLogs: (_, { limit = 50 }) => repo.getAuditLogs(limit)
  },
  Workout: {
    exercises: (parent) => repo.getExercisesForWorkout(parent.id)
  },
  Mutation: {
    addWorkout: (_, { workout }, context) => repo.createWorkout(workout, context.userId),
    updateWorkout: (_, { id, workout }, context) => repo.updateWorkout(id, workout, context.userId),
    deleteWorkout: (_, { id }, context) => repo.deleteWorkout(id, context.userId),

    addExercise: (_, { workoutId, exercise }, context) => repo.createExercise({ workoutId, ...exercise }, context.userId),
    updateExercise: (_, { id, exercise }, context) => repo.updateExercise(id, exercise, context.userId),
    deleteExercise: (_, { id }, context) => repo.deleteExercise(id, context.userId)
  }
};
