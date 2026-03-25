export default class TrainingPlan {
  constructor(
    public id: number | null,
    public name: string,
    public workoutIds: number[] = []
  ) {}
}