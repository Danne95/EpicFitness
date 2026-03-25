import { getDB } from '../database/db';
import Log from '../models/Log';

export default class LogService {
  static async create(log: Log): Promise<void> {
    const db = getDB();

    await db.runAsync(
      `INSERT INTO logs 
       (exercise_id, date, sets, reps, duration, weight, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        log.exerciseId,
        log.date,
        log.sets ?? null,
        log.reps ?? null,
        log.duration ?? null,
        log.weight ?? null,
        log.notes ?? ''
      ]
    );
  }

  static async getAll(): Promise<any[]> {
    const db = getDB();
    return await db.getAllAsync(
      `SELECT * FROM logs ORDER BY date DESC`
    );
  }
}