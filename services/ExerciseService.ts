import { getDB } from '../database/db';
import Exercise from '../models/Exercise';

export default class ExerciseService {
  static async create(exercise: Exercise): Promise<number> {
    const db = getDB();

    const result = await db.runAsync(
      `INSERT INTO exercises (name, primary_muscle, secondary_muscle, category, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        exercise.name,
        exercise.primaryMuscle,
        exercise.secondaryMuscle,
        exercise.category,
        exercise.notes
      ]
    );

    return result.lastInsertRowId;
  }

  static async getAll(): Promise<Exercise[]> {
    const db = getDB();

    const rows = await db.getAllAsync(`SELECT * FROM exercises`);

    return rows.map(
      (r: any) =>
        new Exercise(
          r.id,
          r.name,
          r.primary_muscle,
          r.secondary_muscle,
          r.category,
          r.notes
        )
    );
  }

  static async update(ex: Exercise): Promise<void> {
    const db = getDB();
    await db.runAsync(
      `UPDATE exercises SET name=?, primary_muscle=?, secondary_muscle=?, category=?, notes=? WHERE id=?`,
      [ex.name, ex.primaryMuscle, ex.secondaryMuscle, ex.category, ex.notes, ex.id]
    );
  }

  static async delete(id: number): Promise<void> {
    const db = getDB();
    await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
  }
}