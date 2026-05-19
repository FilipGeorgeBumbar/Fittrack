import { gql } from '@apollo/client';

export const ADD_WORKOUT = gql`
  mutation AddWorkout($workout: WorkoutInput!) {
    addWorkout(workout: $workout) {
      id
      name
      type
      date
      duration
      status
      notes
    }
  }
`;

export const UPDATE_WORKOUT = gql`
  mutation UpdateWorkout($id: ID!, $workout: WorkoutInput!) {
    updateWorkout(id: $id, workout: $workout) {
      id
      name
      type
      date
      duration
      status
      notes
    }
  }
`;

export const DELETE_WORKOUT = gql`
  mutation DeleteWorkout($id: ID!) {
    deleteWorkout(id: $id)
  }
`;

export const ADD_EXERCISE = gql`
  mutation AddExercise($workoutId: ID!, $exercise: ExerciseInput!) {
    addExercise(workoutId: $workoutId, exercise: $exercise) {
      id
      name
      sets
      reps
      weight
    }
  }
`;

export const DELETE_EXERCISE = gql`
  mutation DeleteExercise($id: ID!) {
    deleteExercise(id: $id)
  }
`;
