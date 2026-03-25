import { getDB } from '../database/db';
import Exercise from '../models/Exercise';

export default class ExerciseService {

  // Create a new exercise
  static async create(exercise: Exercise): Promise<number> {
    const db = getDB();
    const result = await db.runAsync(
      `INSERT INTO exercises (name, primary_muscle, secondary_muscle, category, notes, favorite)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        exercise.name,
        exercise.primaryMuscle,
        exercise.secondaryMuscle,
        exercise.category,
        exercise.notes,
        exercise.favorite ? 1 : 0
      ]
    );
    return result.lastInsertRowId;
  }

  // Get all exercises from DB, map snake_case → camelCase
  static async getAll(): Promise<Exercise[]> {
    const db = getDB();
    const rows = await db.getAllAsync(`SELECT * FROM exercises`);

    return rows.map((r: any) =>
      new Exercise(
        r.id,
        r.name,
        r.primary_muscle,       // map correctly
        r.secondary_muscle,     // map correctly
        r.category,
        r.notes,
        r.favorite === 1         // convert int → boolean
      )
    );
  }

  // Update exercise
  static async update(ex: Exercise): Promise<void> {
    const db = getDB();
    await db.runAsync(
      `UPDATE exercises SET name=?, primary_muscle=?, secondary_muscle=?, category=?, notes=?, favorite=? WHERE id=?`,
      [ex.name, ex.primaryMuscle, ex.secondaryMuscle, ex.category, ex.notes, ex.favorite ? 1 : 0, ex.id]
    );
  }

  // Delete exercise
  static async delete(id: number): Promise<void> {
    const db = getDB();
    await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
  }

  // Toggle favorite
  static async toggleFavorite(id: number, value: boolean) {
    const db = getDB();
    await db.runAsync(`UPDATE exercises SET favorite=? WHERE id=?`, [value ? 1 : 0, id]);
  }
}