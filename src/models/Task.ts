export class Task {
  constructor(
    public id?: number,
    public title: string = "",
    public done: boolean = false,
    public listId?: number, // Antes categoryId
    public createdAt: Date = new Date(),
    public scheduledFor?: Date
  ) {}

}

