import { TaskDB } from "@/services/TaskService";
import { Task } from "@/models/Task";
import { TaskList } from "@/models/TaskList";
import { TaskDetails } from "@/models/TaskDetails";

export async function importDataFromJson(data: {
  lists: TaskList[];
  tasks: Task[];
  taskDetails?: TaskDetails[];
}) {
  const db = new TaskDB();

  try {
    console.log("Limpando banco atual...");
    await db.transaction("rw", db.lists, db.tasks, db.taskDetails, async () => {
      await db.lists.clear();
      await db.tasks.clear();
      await db.taskDetails.clear();
    });

    console.log("Importando listas...");
    const listIdMap = new Map<number, number>(); // mapeia id antigo -> novo id

    for (const list of data.lists) {
      const newId = await db.lists.add(new TaskList(undefined, list.name));
      if (list.id !== undefined) listIdMap.set(list.id, newId);
    }

    console.log("Importando tarefas...");
    const taskIdMap = new Map<number, number>();

    for (const task of data.tasks) {
      const listId = task.listId ? listIdMap.get(task.listId) : undefined;

      const newId = await db.tasks.add(
        new Task(
          undefined,
          task.title,
          task.done,
          listId,
          new Date(task.createdAt),
          task.scheduledFor ? new Date(task.scheduledFor) : undefined,
          task.remindBefore,
          task.repeatEvery,
        task.priority as 'Urgente' | 'Importante' | 'Normal'
        )
      );

      if (task.id !== undefined) taskIdMap.set(task.id, newId);
    }

    if (data.taskDetails?.length) {
      console.log("Importando detalhes...");
      for (const detail of data.taskDetails) {
        const taskId = detail.taskId ? taskIdMap.get(detail.taskId) : undefined;
        if (taskId) {
          await db.taskDetails.add(
            new TaskDetails(undefined, taskId, detail.content, new Date(detail.createdAt))
          );
        }
      }
    }

    console.log("Importação concluída com sucesso!");
  } catch (err) {
    console.error("Erro ao importar dados:", err);
  } finally {
    db.close();
  }
}
