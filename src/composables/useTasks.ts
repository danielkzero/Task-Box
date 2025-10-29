import { ref, computed, watch } from "vue";
import { TaskService } from "@/services/TaskService";
import type { Task } from "@/models/Task";
import moment from "moment";

const service = new TaskService();

export function useTasks(selectedListId: any) {
  const tasks = ref<Task[]>([]);
  const sortMode = ref<"order" | "date" | "priority">("date");
  const sortDirection = ref<"asc" | "desc">("asc"); 

  const sortByPriority = (tasks: Task[]) => {
    const order = { Urgente: 0, Importante: 1, Normal: 2 };
    return tasks.slice().sort((a, b) => {
      const diff = order[a.priority] - order[b.priority];
      return sortDirection.value === "asc" ? diff : -diff;
    });
  };

  // Recarrega automaticamente quando muda a lista selecionada
  watch(
    selectedListId,
    async (newListId) => {
      if (newListId) await loadTasks();
      else tasks.value = [];
    },
    { immediate: true }
  );

  const sortedTasks = computed(() => {
    let result = tasks.value.slice();

    if (sortMode.value === "priority") {
      result = sortByPriority(result);
    } else if (sortMode.value === "date") {
      result.sort((a, b) => {
        const diff =
          (a.scheduledFor?.getTime() || 0) -
          (b.scheduledFor?.getTime() || 0);
        return sortDirection.value === "asc" ? diff : -diff;
      });
    }

    return result;
  });

  // Alternar o modo de ordenação e direção
  function setSortMode(mode: "order" | "date" | "priority") {
    if (sortMode.value === mode) {
      // mesmo modo → inverte a direção
      sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
      // modo novo → define ascendente por padrão
      sortMode.value = mode;
      sortDirection.value = "asc";
    }
  }

  // Tarefas derivadas
  const pendingTasks = computed(() => sortedTasks.value.filter((t) => !t.done));
  const completedTasks = computed(() =>
    sortedTasks.value.filter((t) => t.done)
  );

  // Métodos
  async function loadTasks() {
    if (!selectedListId.value) return;
    const list = await service.listTasks(selectedListId.value);
    tasks.value = list.map(t => ({
    ...t,
    scheduledFor: t.scheduledFor ? moment(t.scheduledFor).local().toDate() : undefined,
  }));
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
    sortDirection, 
    setSortMode,  
    loadTasks,
    toggle,
    addTask,
    updateTask,
    deleteCompleted,
  };
}
