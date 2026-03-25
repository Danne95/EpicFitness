import { getDB } from '../database/db';
import Workout from '../models/Workout';

export default class WorkoutService {
  static async create(workout: Workout): Promise<number> {
    const db = getDB();

    const result = await db.runAsync(
      `INSERT INTO workouts (name) VALUES (?)`,
      [workout.name]
    );

    const workoutId = result.lastInsertRowId;

    for (const ex of workout.exercises) {
      await db.runAsync(
        `INSERT INTO workout_exercises 
         (workout_id, exercise_id, sets, reps, duration, weight, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          workoutId,
          ex.exerciseId,
          ex.sets,
          ex.reps ?? null,
          ex.duration ?? null,
          ex.weight ?? null,
          ex.notes ?? ''
        ]
      );
    }

    return workoutId;
  }

  static async getAll(): Promise<any[]> {
    const db = getDB();
    return await db.getAllAsync(`SELECT * FROM workouts`);
  }
}