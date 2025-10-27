import { ref, computed, watch } from "vue";
import { TaskService } from "@/services/TaskService";
import type { Task } from "@/models/Task";

const service = new TaskService();

export function useTasks(selectedListId: any) {
  const tasks = ref<Task[]>([]);
  const sortMode = ref<"order" | "date">("order");

  // 🔁 Recarrega automaticamente quando muda a lista selecionada
  watch(selectedListId, async (newListId) => {
    if (newListId) await loadTasks();
    else tasks.value = [];
  }, { immediate: true });

  const sortedTasks = computed(() => {
    if (!tasks.value) return [];

    if (sortMode.value === "date") {
      return [...tasks.value].sort((a, b) => {
        const da = a.scheduledFor ?? a.createdAt;
        const db = b.scheduledFor ?? b.createdAt;
        return new Date(da).getTime() - new Date(db).getTime();
      });
    }

    // Mantém a ordem original (do banco/localStorage) se for "order"
    return [...tasks.value];
  });

  // Tarefas derivadas, mas mantendo a ordenação de sortedTasks
  const pendingTasks = computed(() =>
    sortedTasks.value.filter(t => !t.done)
  );

  const completedTasks = computed(() =>
    sortedTasks.value.filter(t => t.done)
  );

  // ───────────────────────────────────────────────────────────────
  // Métodos
  async function loadTasks() {
    if (!selectedListId.value) return;
    tasks.value = await service.listTasks(selectedListId.value);
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
    pendingTasks,
    completedTasks,
    sortMode,
    loadTasks,
    toggle,
    addTask,
    updateTask,
    deleteCompleted,
  };
}
