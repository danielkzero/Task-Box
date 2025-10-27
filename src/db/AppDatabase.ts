import Dexie, { type Table } from "dexie";
import { Task } from "@/models/Task";
import { TaskList } from "@/models/TaskList";

export class AppDatabase extends Dexie {
  tasks!: Table<Task, number>;
  lists!: Table<TaskList, number>;

  constructor() {
    super("TaskDB");

    this.version(5).stores({
      tasks: "++id,title,done,listId,createdAt,scheduledFor,[listId+done]",
      lists: "++id,name",
    });
  }
}

// Instância única (singleton)
export const db = new AppDatabase();