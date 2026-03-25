// models/Exercise.ts
export default class Exercise {
  constructor(
    public id: number | null,
    public name: string,
    public primaryMuscle: string,
    public secondaryMuscle: string,
    public category: 'strength' | 'cardio' | 'stretching' | 'warmup' | string,
    public notes: string,
    public favorite: boolean = false
  ) {}
}