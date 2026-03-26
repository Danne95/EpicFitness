export default class Workout {
  constructor(
    public id: number | null,
    public name: string,
    public exercises: WorkoutExercise[] = [],
    public favorite: boolean = false
  ) {}
}

export class WorkoutExercise {
  constructor(
    public id: number | null,
    public workoutId: number,
    public exerciseId: number,

    public orderIndex: number,

    public sets?: number,
    public reps?: number,
    public duration?: number,
    public weight?: number,
    public restTime?: number,
    public notes?: string
  ) {}
}