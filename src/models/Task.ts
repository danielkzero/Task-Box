//models/Task.ts
import moment from 'moment';

export type Priority = 'Urgente' | 'Importante' | 'Normal' | undefined; //<-- não estou usando ainda vai ser usado futuramente

export class Task {
  constructor(
    public id?: number,
    public title: string = "",
    public done: boolean = false,
    public listId?: number, 
    public createdAt: Date = moment(new Date()).local().toDate(),
    public scheduledFor?: Date,
    public remindBefore?: number, 
    public repeatEvery?: number, 
    public priority?: Priority,
    public idTaskParent?: number
  ) {}
}

