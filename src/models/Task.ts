import moment from 'moment';
import { TaskDetails } from './TaskDetails';
export class Task {
  constructor(
    public id?: number,
    public title: string = "",
    public done: boolean = false,
    public listId?: number, 
    public createdAt: Date = moment(new Date()).local().toDate(),
    public scheduledFor?: Date
  ) {}
}

