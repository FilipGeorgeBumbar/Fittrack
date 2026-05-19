import { gql } from '@apollo/client';

export const GET_WORKOUTS = gql`
  query GetWorkouts($offset: Int, $limit: Int, $filter: WorkoutFilter, $sort: WorkoutSort) {
    getWorkouts(offset: $offset, limit: $limit, filter: $filter, sort: $sort) {
      results {
        id
        name
        type
        date
        duration
        status
        notes
        exercises {
          id
          name
          sets
          reps
          weight
        }
      }
      total
    }
  }
`;

export const GET_WORKOUT_BY_ID = gql`
  query GetWorkoutById($id: ID!) {
    getWorkoutById(id: $id) {
      id
      name
      type
      date
      duration
      status
      notes
      exercises {
        id
        name
        sets
        reps
        weight
      }
    }
  }
`;
