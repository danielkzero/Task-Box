import { ref, computed } from "vue";
import { TaskService } from "@/services/TaskService";
import type { TaskList } from "@/models/TaskList";

const service = new TaskService();

export function useTaskLists() {
  const lists = ref<TaskList[]>([]);
  const selectedListId = ref<number | undefined>();

  const currentListName = computed(() => {
    const list = lists.value.find((l) => l.id === selectedListId.value);
    return list ? list.name : "Lista";
  });

  async function loadLists() {
    lists.value = await service.listLists();
    if (!selectedListId.value && lists.value.length > 0)
      selectedListId.value = lists.value[0].id;
  }

  async function selectList(id?: number) {
    if (!id) return;
    selectedListId.value = id;
    await loadLists();
  }

  return { lists, selectedListId, currentListName, loadLists, selectList };
}
