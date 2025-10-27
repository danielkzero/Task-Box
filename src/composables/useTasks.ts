import { ref, computed } from "vue";
import { TaskService } from "@/services/TaskService";
import type { Task } from "@/models/Task";
import moment from "moment";

const service = new TaskService();

export function useTasks(selectedListId: any) {
  const tasks = ref<Task[]>([]);
  const sortMode = ref<"order" | "date">("order");

  const sortedTasks = computed(() => {
    if (!tasks.value) return [];
    if (sortMode.value === "date") {
      return [...tasks.value].sort(
        (a, b) =>
          (a.scheduledFor?.getTime() ?? 0) - (b.scheduledFor?.getTime() ?? 0)
      );
    }
    return tasks.value;
  });

  async function loadTasks() {
    if (selectedListId.value) {
      tasks.value = await service.listTasks(selectedListId.value);
    }
  }

  async function toggle(id?: number) {
    if (!id) return;
    await service.toggleTask(id);
    await loadTasks();
  }

  async function addTask(task: Task) {
    await service.addTask(task);
    await loadTasks();
  }

  async function updateTask(task: Task) {
    await service.updateTask(task);
    await loadTasks();
  }

  async function deleteCompleted() {
    if (!selectedListId.value) return;
    await service.deleteCompletedTasks(selectedListId.value);
    await loadTasks();
  }

  return {
    tasks,
    sortedTasks,
    sortMode,
    loadTasks,
    toggle,
    addTask,
    updateTask,
    deleteCompleted,
  };
}
