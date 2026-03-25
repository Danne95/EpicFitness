export class WorkoutExercise {
  constructor(
    public exerciseId: number,
    public sets: number,
    public reps?: number,
    public duration?: number,
    public weight?: number,
    public notes?: string
  ) {}
}

export default class Workout {
  constructor(
    public id: number | null,
    public name: string,
    public exercises: WorkoutExercise[] = []
  ) {}
}