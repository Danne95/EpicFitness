import Workout from './Workout';

export class PlanWorkout {
  constructor(
    public id: number | null,
    public planId: number,
    public workoutId: number,
    public sequence: number,
    public workout?: Workout
  ) {}
}

export default class TrainingPlan {
  constructor(
    public id: number | null,
    public name: string,
    public workoutIds: number[] = [],
    public favorite: boolean = false,
    public workouts: PlanWorkout[] = []
  ) {}
}
