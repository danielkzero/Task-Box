<!-- TaskPage.vue -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Task Box</ion-title>
            </ion-toolbar>

            <!-- Lista de tarefas -->
            <div class="list-menu" ref="listMenuRef">
                <ion-button v-for="list in lists" :key="list.id" fill="clear"
                    :color="list.id === selectedListId ? 'primary' : 'medium'"
                    @click="selectList(list.id), autoScrollMenu()">
                    {{ list.name }}
                </ion-button>

                <ion-button fill="clear" color="primary" @click="newListPrompt">
                    <ion-icon slot="start" name="add-outline"></ion-icon>
                    Nova Lista
                </ion-button>
            </div>
        </ion-header>

        <ion-content>
            <!-- Cartão com as tarefas da lista selecionada -->
            <ion-card v-if="lists.length > 0">
                <!-- Ações da lista -->
                <ion-item lines="none" style="padding-top: 0.25rem; padding-bottom: 0;">
                    <ion-label>{{ currentListName }}</ion-label>
                    <ion-buttons slot="end">
                        <ion-button fill="clear" @click="openSortActionSheet">
                            <ion-icon slot="icon-only" name="chevron-expand-outline"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" @click="openListActionSheet">
                            <ion-icon slot="icon-only" name="ellipsis-vertical-outline"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-item>

                <!-- Tarefas vazias -->
                <ion-list v-if="pendingTasks.length === 0 && !loadingTask">
                    <EmptyState image="/9276414.jpg" alt="Sem tarefas" title="Parece que essa lista está vazia...">
                        Que tal criar uma tarefa agora? <br />
                        Clique no <strong>+</strong> e comece a se organizar!
                    </EmptyState>
                </ion-list>
            </ion-card>

            <!-- Nenhuma lista existente -->
            <EmptyState v-else-if="!loadingTask" image="/9276421.jpg" alt="Sem listas"
                title="Você ainda não criou nenhuma lista!">
                Clique em <strong>+ Nova Lista</strong> para começar a organizar suas tarefas.
            </EmptyState>

            <!-- Agrupamento de tarefas (PASSADAS, HOJE, FUTURAS, etc.) -->
            <template v-for="(tasks, group) in groupedTasks" :key="group">
                <ion-card>
                    <ion-item lines="none">
                        <ion-label>{{ group }}</ion-label>
                        <ion-badge slot="end">{{ tasks.length }}</ion-badge>
                    </ion-item>

                    <ion-list>
                        <ion-item v-for="t in tasks" :key="t.id" lines="none">
                            <ion-checkbox slot="start" :checked="t.done" @ionChange.stop="toggle(t.id)"></ion-checkbox>
                            <ion-label @click="goToTaskDetails(t)">
                                <h2 :style="{ textDecoration: t.done ? 'line-through' : 'none' }">
                                    {{ t.title }}
                                </h2>
                                <small>
                                    Criada: {{ formatDate(t.createdAt) }}
                                    <span v-if="t.scheduledFor">
                                        | Agendada: {{ formatDateTime(t.scheduledFor) }}
                                    </span>
                                    <span v-if="t.idTaskParent"> | Repetição</span>
                                </small>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-card>
            </template>

            <!-- Tarefas concluídas -->
            <ion-card v-if="completedTasks.length > 0">
                <ion-accordion-group>
                    <ion-accordion>
                        <ion-item slot="header">
                            <ion-label>CONCLUÍDAS</ion-label>
                            <ion-badge slot="end">{{ completedTasks.length }}</ion-badge>
                        </ion-item>
                        <ion-list slot="content">
                            <ion-item v-for="t in completedTasks" :key="t.id" lines="none">
                                <ion-checkbox slot="start" :checked="t.done"
                                    @ionChange.stop="toggle(t.id)"></ion-checkbox>
                                <ion-label @click="goToTaskDetails(t)">
                                    <h2 style="text-decoration: line-through;">{{ t.title }}</h2>
                                    <small>
                                        Criada: {{ formatDate(t.createdAt) }}
                                        <span v-if="t.scheduledFor">
                                            | Agendada: {{ formatDateTime(t.scheduledFor) }}
                                        </span>
                                        <span v-if="t.idTaskParent"> | Repetição</span>
                                    </small>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                    </ion-accordion>
                </ion-accordion-group>
            </ion-card>

            <!-- Botão para nova tarefa -->
            <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="lists.length > 0">
                <ion-fab-button @click="newTaskPrompt">
                    <ion-icon name="add-outline"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>

        <!-- Rodapé -->
        <ion-footer>
            <ion-toolbar color="light">
                <ion-buttons slot="end">
                    <ion-button router-link="/sobre" color="medium" fill="clear">
                        <ion-icon slot="start" name="information-circle-outline"></ion-icon>
                        Sobre o Task Box
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-footer>

        <!-- Modal de nova tarefa -->
        <NewTaskModal :key="`modal_${selectedListId}_${modalKey}`" v-model:isOpen="isTaskModalOpen"
            :selectedListId="selectedListId" @created="handleTaskCreated" />
    </ion-page>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import { alertController, actionSheetController } from "@ionic/vue";
import { Task } from "@/models/Task";
import { useTaskLists } from "@/composables/useTaskLists";
import { useTasks } from "@/composables/useTasks";
import { formatDate, formatDateTime } from "@/utils/formatDate";
import { Preferences } from "@capacitor/preferences";
import { useListScroll } from "@/composables/useListScroll";
import EmptyState from "@/components/EmptyState.vue";
import NewTaskModal from "@/components/modals/NewTaskModal.vue";
import moment from "moment";
import "moment/locale/pt-br";

moment.updateLocale("pt-br", {
    weekdays: ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"],
});

const router = useRouter();
const loadingTask = ref(true);

const { listMenuRef, scrollToSelectedList } = useListScroll();
const { lists, selectedListId, currentListName, loadLists, selectList } = useTaskLists();
const { tasks, sortedTasks, sortMode, sortDirection, loadTasks, toggle, addTask, deleteCompleted, setSortMode } = useTasks(selectedListId);

const pendingTasks = computed(() => sortedTasks.value.filter(t => !t.done));
const completedTasks = computed(() => sortedTasks.value.filter(t => t.done));
const modalKey = ref(0);

// Agrupar tarefas por período
const groupedTasks = computed(() => {
    const groups: Record<string, Task[]> = {};
    const now = moment();

    pendingTasks.value.forEach(task => {
        let key = "SEM DATA";

        if (task.scheduledFor) {
            const date = moment(task.scheduledFor);
            if (date.isBefore(now, "day")) key = "PASSADAS";
            else if (date.isSame(now, "day")) key = "HOJE";
            else if (date.isSame(now.clone().add(1, "day"), "day")) key = "AMANHÃ";
            else if (date.isSame(now, "week")) key = date.format("dddd").replace("-FEIRA", "").toUpperCase();
            else if (date.isSame(now.clone().add(1, "week"), "week")) key = "SEMANA QUE VEM";
            else key = "FUTURAS";
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
    });

    return groups;
});

function goToTaskDetails(t: Task) {
    if (t.id) router.push(`/detalhes-tarefa/${t.id}`);
}

const isTaskModalOpen = ref(false);

function newTaskPrompt() {
    if (!selectedListId.value) return;
    modalKey.value++;
    isTaskModalOpen.value = true;
}

async function handleTaskCreated(payload: { task: Task; copies?: Task[] }) {
    const { task, copies = [] } = payload;
    if (!task) return;

    // cria service local (import dinâmico para manter lazy-loading e bundle pequeno)
    const { TaskService } = await import("@/services/TaskService");
    const service = new TaskService();

    // 1) salva a tarefa principal e pega o id
    const mainId = await service.addTask(task);

    // 2) salva cada cópia definindo idTaskParent = mainId
    for (const copy of copies) {
        copy.idTaskParent = mainId;
        await service.addTask(copy);
    }

    // 3) atualiza UI
    await loadTasks();
}


async function newListPrompt() {
    const alert = await alertController.create({
        header: "Nova Lista",
        inputs: [{ name: "name", type: "text", placeholder: "Nome da lista" }],
        buttons: [
            { text: "Cancelar", role: "cancel" },
            {
                text: "Criar",
                handler: async (data) => {
                    if (!data.name.trim()) return;
                    const { TaskService } = await import("@/services/TaskService");
                    const service = new TaskService();
                    const id = await service.addList({ id: undefined, name: data.name });
                    selectedListId.value = id;
                    await loadLists();
                    await loadTasks();
                },
            },
        ],
    });
    await alert.present();
}

async function openSortActionSheet() {
    const sheet = await actionSheetController.create({
        header: "Ordenar tarefas",
        buttons: [
            {
                text: `Data ${sortMode.value === "date" ? getDirectionIcon() : ""}`,
                icon: "calendar-outline",
                handler: () => setSortMode("date"),
            },
            { text: "Cancelar", icon: "close-outline", role: "cancel" },
        ],
    });
    await sheet.present();
}

function getDirectionIcon() {
    return sortDirection.value === "asc" ? "↑" : "↓";
}

async function openListActionSheet() {
    const sheet = await actionSheetController.create({
        header: "Ações da lista",
        buttons: [
            { text: "Renomear lista", icon: "create-outline", handler: renameList },
            { text: "Excluir lista", icon: "trash-outline", role: "destructive", handler: deleteList },
            { text: "Excluir concluídas", icon: "checkmark-done-outline", handler: deleteCompleted },
            { text: "Cancelar", icon: "close-outline", role: "cancel" },
        ],
    });
    await sheet.present();
}

async function renameList() {
    if (!selectedListId.value) return;
    const list = lists.value.find(l => l.id === selectedListId.value);
    if (!list) return;

    const alert = await alertController.create({
        header: "Renomear lista",
        inputs: [{ name: "name", type: "text", value: list.name }],
        buttons: [
            { text: "Cancelar", role: "cancel" },
            {
                text: "Salvar",
                handler: async (data) => {
                    list.name = data.name;
                    const { TaskService } = await import("@/services/TaskService");
                    const service = new TaskService();
                    await service.updateList(list);
                    await loadLists();
                },
            },
        ],
    });
    await alert.present();
}

async function deleteList() {
    if (!selectedListId.value) return;
    const alert = await alertController.create({
        header: "Excluir lista",
        message: "Deseja realmente excluir esta lista e todas as tarefas?",
        buttons: [
            { text: "Cancelar", role: "cancel" },
            {
                text: "Excluir",
                role: "destructive",
                handler: async () => {
                    const { TaskService } = await import("@/services/TaskService");
                    const service = new TaskService();
                    await service.deleteList(selectedListId.value!);
                    selectedListId.value = lists.value[0]?.id;
                    await loadLists();
                    await loadTasks();
                },
            },
        ],
    });
    await alert.present();
}

function autoScrollMenu() {
    setTimeout(scrollToSelectedList, 300);
}

watch(selectedListId, async (newVal) => {
    if (newVal) {
        await Preferences.set({ key: "selectedListId", value: newVal.toString() });
    }
});

onMounted(async () => {
    const savedListId = await Preferences.get({ key: "selectedListId" });
    if (savedListId.value) selectedListId.value = parseInt(savedListId.value);

    await loadLists();
    await loadTasks();
    autoScrollMenu();
    setTimeout(() => (loadingTask.value = false), 500);
});
</script>

<style>
.list-menu {
    display: flex;
    overflow-x: auto;
    padding: 0.25rem;
    background-color: var(--ion-color-light);
}

.list-menu ion-button {
    margin-right: 0.5rem;
    flex: 0 0 auto;
}
</style>
