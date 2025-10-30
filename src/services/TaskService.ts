// src/services/TaskService.ts
import Dexie, { Table } from "dexie";
import { Task } from "@/models/Task";
import { TaskList } from "@/models/TaskList";
import { TaskDetails } from "@/models/TaskDetails";
import { LocalNotifications } from "@capacitor/local-notifications";
import moment from "moment";

export class TaskDB extends Dexie {
  tasks!: Table<Task, number>;
  lists!: Table<TaskList, number>;
  taskDetails!: Table<TaskDetails, number>;

  constructor() {
    super("TaskDB");
    // versão atualizada (sem schedules)
    this.version(10).stores({
      tasks: "++id,title,done,listId,createdAt,scheduledFor,idTaskParent",
      lists: "++id,name",
      taskDetails: "++id,taskId,content,createdAt",
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
    // Excluir todas as tasks associadas
    const tasksToDelete = await this.db.tasks
      .where("listId")
      .equals(id)
      .toArray();
    await Promise.all(tasksToDelete.map((t) => this.deleteTask(t.id!)));

    return this.db.lists.delete(id);
  }

  // --- Tarefas ---
  async listTasks(listId?: number) {
    if (!listId) return this.db.tasks.toArray();
    return this.db.tasks.where("listId").equals(listId).toArray();
  }

  async addTask(task: Task) {
    const id = await this.db.tasks.add(task);
    await this.scheduleNotification(task, id);
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
      remindBefore: task.remindBefore,
      repeatEvery: task.repeatEvery,
      priority: task.priority,
      idTaskParent: task.idTaskParent,
    };

    const updatedId = await this.db.tasks.put(plain);

    // Cancelar e reagendar notificações
    await LocalNotifications.cancel({ notifications: [{ id: task.id! }] });
    await this.scheduleNotification(task, task.id!);

    return updatedId;
  }

  async deleteTask(id: number) {
    await this.db.tasks.delete(id);
    // Também remove filhos (instâncias recorrentes)
    await this.db.tasks.where("idTaskParent").equals(id).delete();
  }

  async toggleTask(id: number) {
    const task = await this.db.tasks.get(id);
    if (!task) return;

    task.done = !task.done;
    await this.updateTask(task);

    // Se for tarefa concluída e tiver repetição, gerar nova instância
    if (task.done && task.repeatEvery && !task.idTaskParent) {
      await this.generateNextInstance(task);
    }
  }

  async deleteCompletedTasks(listId?: number): Promise<void> {
    if (listId == null) return;
    const doneTasks = await this.db.tasks
      .filter((t) => t.listId === listId && t.done === true)
      .toArray();
    await Promise.all(doneTasks.map((t) => this.deleteTask(t.id!)));
  }

  // === Buscar tarefa por ID ===
  async getTaskById(id: number) {
    return this.db.tasks.get(id);
  }

  // === Buscar tarefas-filhas de uma tarefa pai ===
  async getTasksByParent(parentId: number) {
    return this.db.tasks.where("idTaskParent").equals(parentId).toArray();
  }

  // --- Tarefas Filhas (instâncias recorrentes) ---
  private async generateNextInstance(parent: Task) {
    if (!parent.scheduledFor || !parent.repeatEvery) return;

    const nextDate = moment(parent.scheduledFor)
      .add(parent.repeatEvery, "days") // futuramente pode ser “hours” ou “weeks”
      .toDate();

    const newTask = new Task(
      undefined,
      parent.title,
      false,
      parent.listId,
      moment().toDate(),
      nextDate,
      parent.remindBefore,
      parent.repeatEvery,
      parent.priority,
      parent.id // <-- liga ao pai
    );

    const newId = await this.db.tasks.add(newTask);
    await this.scheduleNotification(newTask, newId);
  }

  // --- Detalhes ---
  async listTaskDetails(taskId?: number): Promise<TaskDetails[]> {
    if (!taskId) return this.db.table("taskDetails").toArray();
    return this.db
      .table("taskDetails")
      .where("taskId")
      .equals(taskId)
      .toArray();
  }

  async addTaskDetail(detail: TaskDetails) {
    return this.db.table("taskDetails").add(detail);
  }

  async updateTaskDetail(detail: TaskDetails) {
    return this.db.table("taskDetails").put(detail);
  }

  async deleteTaskDetail(id: number) {
    return this.db.table("taskDetails").delete(id);
  }

  // --- Notificações ---
  private async scheduleNotification(
    task: Task,
    id: number,
    scheduledFor: Date | undefined = undefined
  ) {
    const target = scheduledFor || task.scheduledFor;
    if (!target) return;

    const now = new Date();
    const scheduled = moment(target).local().toDate();

    const date = new Date(
      scheduled.getTime() - (task.remindBefore ?? 15) * 60000
    );

    // Não agenda se já passou
    if (date <= now) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: "Lembrete",
          body: `📅 ${task.title}`,
          schedule: { at: date },
          sound: "bell.wav",
          smallIcon: "res://ic_notification",
          iconColor: "#177fec",
        },
      ],
    });
  }
}
