import { getDB } from '../database/db';
import TrainingPlan from '../models/TrainingPlan';

export default class PlanService {
  static async create(plan: TrainingPlan): Promise<number> {
    const db = getDB();

    const result = await db.runAsync(
      `INSERT INTO training_plans (name) VALUES (?)`,
      [plan.name]
    );

    const planId = result.lastInsertRowId;

    for (let i = 0; i < plan.workoutIds.length; i++) {
      await db.runAsync(
        `INSERT INTO plan_workouts (plan_id, workout_id, sequence)
         VALUES (?, ?, ?)`,
        [planId, plan.workoutIds[i], i]
      );
    }

    return planId;
  }

  static async getAll(): Promise<any[]> {
    const db = getDB();
    return await db.getAllAsync(`SELECT * FROM training_plans`);
  }
}