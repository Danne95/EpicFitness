export default class Log {
  constructor(
    public id: number | null,
    public exerciseId: number,
    public date: string,
    public sets?: number,
    public reps?: number,
    public duration?: number,
    public weight?: number,
    public notes?: string
  ) {}
}