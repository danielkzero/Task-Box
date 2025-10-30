// TaskDetails.ts
export class TaskDetails {
  constructor(
    public id?: number,
    public taskId?: number,
    public content?: string,
    public createdAt: Date = new Date()
  ) {}
}
