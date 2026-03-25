// models/Exercise.ts
export default class Exercise {
  constructor(
    public id: number | null,
    public name: string,
    public primaryMuscle: string,
    public secondaryMuscle: string,
    public category: 'strength' | 'cardio' | string,
    public notes: string
  ) {}
}