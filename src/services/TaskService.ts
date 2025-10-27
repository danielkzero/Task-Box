// src/services/TaskService.ts
import Dexie, { Table } from "dexie";
import { Task } from "@/models/Task";
import { TaskList } from "@/models/TaskList";
import { LocalNotifications } from '@capacitor/local-notifications';

export class TaskDB extends Dexie {
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

export class TaskService {
  public db = new TaskDB();

  // --- Listas ---
  async listLists(): Promise<TaskList[]> {
    return this.db.lists.toArray();
  }
  async addList(list: TaskList) {
    return this.db.lists.add(list);
  }
  async updateList(list: TaskList) {
    const plain = { id: list.id, name: list.name };
    return this.db.lists.put(plain);
  }

  async deleteList(id: number) {
    // Deleta todas as tasks da lista
    const tasksToDelete = await this.db.tasks
      .where("listId")
      .equals(id)
      .toArray();
    await Promise.all(tasksToDelete.map((t) => this.deleteTask(t.id!)));

    // Deleta a própria lista
    return this.db.lists.delete(id);
  }

  // --- Tasks ---
  async listTasks(listId?: number) {
    if (!listId) return this.db.tasks.toArray();
    return this.db.tasks.where("listId").equals(listId).toArray();
  }

  async addTask(task: Task) {
    const id = await this.db.tasks.add(task);

    // agenda notificação se tiver data
    if (task.scheduledFor) {
      const date = new Date(task.scheduledFor);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: id,
            title: "Lembrete Task Box",
            body: `📅 ${task.title}`,
            schedule: { at: date },
          },
        ],
      });
    }

    return id;
  }
  async updateTask(task: Task) {
    const plain = {
      id: task.id,
      title: task.title,
      done: task.done,
      listId: task.listId,
      createdAt: task.createdAt,
      scheduledFor: task.scheduledFor,
    };
    return this.db.tasks.put(plain);
  }
  async deleteTask(id: number) {
    return this.db.tasks.delete(id);
  }
  async toggleTask(id: number) {
    const task = await this.db.tasks.get(id);
    if (task) {
      task.done = !task.done;
      await this.updateTask(task);
    }
  }

  async deleteCompletedTasks(listId?: number): Promise<void> {
    if (listId == null) return;
    const doneTasks = await this.db.tasks
      .filter((t) => t.listId === listId && t.done === true)
      .toArray();
    await Promise.all(doneTasks.map((t) => this.deleteTask(t.id!)));
  }
}
