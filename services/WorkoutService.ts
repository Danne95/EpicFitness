import { getDB } from '../database/db';
import Workout, { WorkoutExercise } from '../models/Workout';

export default class WorkoutService {

  // ✅ CREATE workout + exercises
  static async create(workout: Workout): Promise<number> {
    const db = getDB();

    const result = await db.runAsync(
      `INSERT INTO workouts (name, favorite) VALUES (?, ?)`,
      [workout.name, workout.favorite ? 1 : 0]
    );

    const workoutId = result.lastInsertRowId;

    let orderIndex = 0;

    for (const ex of workout.exercises) {
      await db.runAsync(
        `INSERT INTO workout_exercises 
         (workout_id, exercise_id, order_index, sets, reps, duration, weight, rest_time, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workoutId,
          ex.exerciseId,
          orderIndex++,                     // ✅ ORDER
          ex.sets ?? null,
          ex.reps ?? null,
          ex.duration ?? null,
          ex.weight ?? null,
          ex.restTime ?? null,
          ex.notes ?? ''
        ]
      );
    }

    return workoutId;
  }

  // ✅ GET ALL workouts WITH exercises
  static async getAll(): Promise<Workout[]> {
    const db = getDB();

    const workoutsRows = await db.getAllAsync(`SELECT * FROM workouts`);

    const workouts: Workout[] = [];

    for (const w of workoutsRows as any[]) {

      const exerciseRows = await db.getAllAsync(
        `SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index ASC`,
        [w.id]
      );

      const exercises: WorkoutExercise[] = exerciseRows.map((r: any) =>
        new WorkoutExercise(
          r.id,
          r.workout_id,
          r.exercise_id,
          r.order_index,
          r.sets ?? undefined,
          r.reps ?? undefined,
          r.duration ?? undefined,
          r.weight ?? undefined,
          r.rest_time ?? undefined,
          r.notes ?? undefined
        )
      );

      workouts.push(
        new Workout(
          w.id,
          w.name,
          exercises,
          w.favorite === 1
        )
      );
    }

    return workouts;
  }

  // ✅ DELETE workout (and its exercises)
  static async delete(id: number): Promise<void> {
    const db = getDB();

    await db.runAsync(`DELETE FROM workout_exercises WHERE workout_id = ?`, [id]);
    await db.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
  }

  // ✅ TOGGLE favorite
  static async toggleFavorite(id: number, value: boolean) {
    const db = getDB();
    await db.runAsync(
      `UPDATE workouts SET favorite=? WHERE id=?`,
      [value ? 1 : 0, id]
    );
  }

  // ✅ UPDATE workout (simple version)
  static async update(workout: Workout): Promise<void> {
    const db = getDB();

    // Update workout main data
    await db.runAsync(
      `UPDATE workouts SET name=?, favorite=? WHERE id=?`,
      [workout.name, workout.favorite ? 1 : 0, workout.id]
    );

    // ⚠️ Simplest approach: delete & recreate exercises
    await db.runAsync(
      `DELETE FROM workout_exercises WHERE workout_id=?`,
      [workout.id]
    );

    let orderIndex = 0;

    for (const ex of workout.exercises) {
      await db.runAsync(
        `INSERT INTO workout_exercises 
         (workout_id, exercise_id, order_index, sets, reps, duration, weight, rest_time, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workout.id,
          ex.exerciseId,
          orderIndex++,
          ex.sets ?? null,
          ex.reps ?? null,
          ex.duration ?? null,
          ex.weight ?? null,
          ex.restTime ?? null,
          ex.notes ?? ''
        ]
      );
    }
  }
}