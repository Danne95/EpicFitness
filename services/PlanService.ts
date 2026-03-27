import { getDB } from '../database/db';
import TrainingPlan, { PlanWorkout } from '../models/TrainingPlan';
import Workout from '../models/Workout';
import WorkoutService from './WorkoutService';

export default class PlanService {
  static async create(plan: TrainingPlan): Promise<number> {
    const db = getDB();

    const result = await db.runAsync(
      `INSERT INTO training_plans (name, favorite) VALUES (?, ?)`,
      [plan.name, plan.favorite ? 1 : 0]
    );

    const planId = result.lastInsertRowId;
    await this.replacePlanWorkouts(planId, plan.workoutIds);

    return planId;
  }

  static async getAll(): Promise<TrainingPlan[]> {
    const db = getDB();
    const planRows = await db.getAllAsync(`SELECT * FROM training_plans`);
    const workouts = await WorkoutService.getAll();
    const workoutMap = new Map<number, Workout>(workouts.map(workout => [workout.id!, workout]));
    const plans: TrainingPlan[] = [];

    for (const row of planRows as any[]) {
      const planWorkoutRows = await db.getAllAsync(
        `SELECT * FROM plan_workouts WHERE plan_id = ? ORDER BY sequence ASC`,
        [row.id]
      );

      const planWorkouts = (planWorkoutRows as any[]).map(
        planWorkout =>
          new PlanWorkout(
            planWorkout.id,
            planWorkout.plan_id,
            planWorkout.workout_id,
            planWorkout.sequence,
            workoutMap.get(planWorkout.workout_id)
          )
      );

      plans.push(
        new TrainingPlan(
          row.id,
          row.name,
          planWorkouts.map(planWorkout => planWorkout.workoutId),
          row.favorite === 1,
          planWorkouts
        )
      );
    }

    return plans;
  }

  static async update(plan: TrainingPlan): Promise<void> {
    const db = getDB();
    await db.runAsync(`UPDATE training_plans SET name=?, favorite=? WHERE id=?`, [
      plan.name,
      plan.favorite ? 1 : 0,
      plan.id,
    ]);

    await this.replacePlanWorkouts(plan.id!, plan.workoutIds);
  }

  static async delete(id: number): Promise<void> {
    const db = getDB();
    await db.runAsync(`DELETE FROM plan_workouts WHERE plan_id = ?`, [id]);
    await db.runAsync(`DELETE FROM training_plans WHERE id = ?`, [id]);
  }

  static async toggleFavorite(id: number, value: boolean): Promise<void> {
    const db = getDB();
    await db.runAsync(`UPDATE training_plans SET favorite=? WHERE id=?`, [value ? 1 : 0, id]);
  }

  private static async replacePlanWorkouts(planId: number, workoutIds: number[]): Promise<void> {
    const db = getDB();

    await db.runAsync(`DELETE FROM plan_workouts WHERE plan_id = ?`, [planId]);

    for (let i = 0; i < workoutIds.length; i++) {
      await db.runAsync(
        `INSERT INTO plan_workouts (plan_id, workout_id, sequence) VALUES (?, ?, ?)`,
        [planId, workoutIds[i], i]
      );
    }
  }
}
