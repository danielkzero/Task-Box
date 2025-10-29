import moment from 'moment';

export type Priority = 'Urgente' | 'Importante' | 'Normal';

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
    public priority: Priority = 'Normal'
  ) {}
}

