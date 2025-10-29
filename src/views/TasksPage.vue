<!-- TaskPage.vue -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Task Box</ion-title>
            </ion-toolbar>
            <!-- Lista de tarefas -->
            <div class="list-menu">
                <ion-button v-for="list in lists" :key="list.id" fill="clear"
                    :color="list.id === selectedListId ? 'primary' : 'medium'" @click="selectList(list.id)">
                    {{ list.name }}
                </ion-button>
                <ion-button fill="clear" color="primary" @click="newListPrompt">
                    <ion-icon slot="start" name="add-outline"></ion-icon> Nova Lista
                </ion-button>
            </div>
        </ion-header>

        <ion-content>
            <!-- Cartão com as tarefas da lista selecionada -->
            <ion-card v-if="lists.length > 0">
                <!-- Ações da lista de tarefas (Ordenar, Renomear ou Excluir) -->
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
                <!-- Tarefas -->
                <ion-list v-if="pendingTasks.length === 0 && !loadingTask">
                    <!-- Informativo caso não tenha tarefas -->
                    <EmptyState v-if="pendingTasks.length === 0" image="/9276414.jpg" alt="Sem tarefas"
                        title="Parece que essa lista está vazia...">
                        Que tal criar uma tarefa agora? <br> Clique no <strong>+</strong> e comece a se
                        organizar!
                    </EmptyState>
                </ion-list>
            </ion-card>
            <!-- Informativo caso não tenha uma lista de tarefas -->
            <EmptyState v-else-if="!loadingTask" image="/9276421.jpg" alt="Sem listas" title="Você ainda não criou nenhuma lista!">
                Clique no <strong>+ Nova Lista</strong> para começar a organizar suas tarefas.
            </EmptyState>

            <!-- Tarefas concluídas -->
            <template v-for="(tasks, group) in groupedTasks" :key="group">
                <ion-card v-if="group == 'PASSADAS'">
                    <ion-accordion-group>
                        <ion-accordion>
                            <ion-item slot="header">
                                <ion-label>{{ group }}</ion-label>
                                <ion-badge slot="end">{{tasks.filter((g) =>
                                    moment(g.scheduledFor).isBefore(moment().startOf('day'))).length}}</ion-badge>
                            </ion-item>
                            <ion-list slot="content">
                                <ion-item v-for="t in tasks" :key="t.id" lines="none">
                                    <ion-checkbox slot="start" :checked="t.done"
                                        @ionChange.stop="toggle(t.id)"></ion-checkbox>
                                    <ion-label @click="goToTaskDetails(t)">
                                        <h2 :style="{ textDecoration: t.done ? 'line-through' : 'none' }">{{ t.title }}
                                        </h2>
                                        <small>
                                            Criada: {{ formatDate(t.createdAt) }}
                                            <span v-if="t.scheduledFor"> | Agendada: {{ formatDateTime(t.scheduledFor)
                                            }}</span>
                                        </small>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-accordion>
                    </ion-accordion-group>
                </ion-card>
            </template>
            <template v-for="(tasks, group) in groupedTasks" :key="group">
                <ion-card v-if="group != 'PASSADAS'">
                    <ion-item lines="none">
                        <ion-label>{{ group }}</ion-label>
                    </ion-item>
                    <ion-list>
                        <ion-item v-for="t in tasks" :key="t.id" lines="none">
                            <ion-checkbox slot="start" :checked="t.done" @ionChange.stop="toggle(t.id)"></ion-checkbox>
                            <ion-label @click="goToTaskDetails(t)">
                                <h2 :style="{ textDecoration: t.done ? 'line-through' : 'none' }">{{ t.title }}</h2>
                                <small>
                                    Criada: {{ formatDate(t.createdAt) }}
                                    <span v-if="t.scheduledFor"> | Agendada: {{ formatDateTime(t.scheduledFor) }}</span>
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
                                    <h2 :style="{ textDecoration: 'line-through' }">{{ t.title }}</h2>
                                    <small>
                                        Criada: {{ formatDate(t.createdAt) }}
                                        <span v-if="t.scheduledFor"> | Agendada: {{ formatDateTime(t.scheduledFor)
                                            }}</span>
                                    </small>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                    </ion-accordion>
                </ion-accordion-group>
            </ion-card>


            <!-- Botão para adicionar uma nova tarefa, visivel quando existe alguma lista de tarefas -->
            <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="lists.length > 0">
                <ion-fab-button @click="newTaskPrompt">
                    <ion-icon name="add-outline"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
        <!-- Botão sobre o task box, técnologias usadas e créditos de imagens -->
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
        <NewTaskModal v-model:isOpen="isTaskModalOpen" :selectedListId="selectedListId" @created="handleTaskCreated" />
    </ion-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import { alertController, actionSheetController } from '@ionic/vue';
import { Task } from '@/models/Task';

import { useTaskLists } from '@/composables/useTaskLists';
import { useTasks } from '@/composables/useTasks';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import EmptyState from '@/components/EmptyState.vue';
import NewTaskModal from '@/components/modals/NewTaskModal.vue';
import { Preferences } from '@capacitor/preferences';

import moment from 'moment';
import 'moment/locale/pt-br';

moment.updateLocale('pt-br', {
    weekdays: ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
});


const router = useRouter();
const loadingTask = ref(true);

const { lists, selectedListId, currentListName, loadLists, selectList } = useTaskLists();
const { tasks, sortedTasks, sortMode, sortDirection, loadTasks, toggle, addTask, deleteCompleted, setSortMode } = useTasks(selectedListId);
const pendingTasks = computed(() => sortedTasks.value.filter(t => !t.done));
const completedTasks = computed(() => sortedTasks.value.filter(t => t.done));

const groupedTasks = computed(() => {
    const groups: Record<string, Task[]> = {};
    const now = moment();

    pendingTasks.value.forEach(task => {
        let key = 'FUTURAS';
        if (task.scheduledFor) {
            const date = moment(task.scheduledFor);
            if (date.isSame(now, 'day')) key = 'HOJE';
            else if (date.isBefore(now.startOf('day'))) key = 'PASSADAS';
            else if (date.isSame(now.clone().add(1, 'day'), 'day')) key = 'AMANHÃ';
            else if (date.isSame(now, 'week')) {
                let day = date.format('dddd').toUpperCase();
                day = day.replace('-FEIRA', '');
                key = day;
            }
            else if (date.isSame(now.clone().add(1, 'week'), 'week')) key = 'SEMANA QUE VEM';
            else if (date.isSame(now, 'month')) key = 'MÊS QUE VEM';
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
    });

    return groups;
});

function goToTaskDetails(t: Task) {
    if (!t.id) return;
    router.push(`/detalhes-tarefa/${t.id}`);
}

const isTaskModalOpen = ref(false);

function newTaskPrompt() {
    if (!selectedListId.value) return;
    isTaskModalOpen.value = true;
}

async function handleTaskCreated(task: Task) {
    await addTask(task);
}

async function newListPrompt() {
    const alert = await alertController.create({
        header: 'Nova Lista',
        inputs: [{ name: 'name', type: 'text', placeholder: 'Nome da lista' }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Criar', handler: async (data) => {
                    if (!data.name.trim()) return;
                    const TaskService = (await import('@/services/TaskService')).TaskService;
                    const service = new TaskService();
                    const id = await service.addList({ id: undefined, name: data.name });
                    selectedListId.value = id;
                    await loadLists();
                    await loadTasks();
                }
            }
        ]
    });
    await alert.present();
}

async function openSortActionSheet() {
    const sheet = await actionSheetController.create({
        header: 'Ordenar tarefas',
        buttons: [
            /*{
                text: `Minha ordem ${sortMode.value === 'order' ? getDirectionIcon() : ''}`,
                icon: 'list-outline',
                handler: () => setSortMode('order'),
            },
            {
                text: `Prioridade ${sortMode.value === 'priority' ? getDirectionIcon() : ''}`,
                icon: 'alert-circle-outline',
                handler: () => setSortMode('priority'),
            },*/
            {
                text: `Data ${sortMode.value === 'date' ? getDirectionIcon() : ''}`,
                icon: 'calendar-outline',
                handler: () => setSortMode('date'),
            },
            {
                text: 'Cancelar',
                icon: 'close-outline',
                role: 'cancel',
            },
        ],
    });
    await sheet.present();
}

// helper para indicar a direção atual (ascendente/descendente)
function getDirectionIcon() {
    return sortDirection.value === 'asc' ? '↑' : '↓';
}

async function openListActionSheet() {
    const sheet = await actionSheetController.create({
        header: 'Ações da lista',
        buttons: [
            { text: 'Renomear lista', icon: 'create-outline', handler: renameList },
            { text: 'Excluir lista', icon: 'trash-outline', role: 'destructive', handler: deleteList },
            { text: 'Excluir concluídas', icon: 'checkmark-done-outline', handler: deleteCompleted },
            { text: 'Cancelar', icon: 'close-outline', role: 'cancel' }
        ]
    });
    await sheet.present();
}

async function renameList() {
    if (!selectedListId.value) return;
    const list = lists.value.find(l => l.id === selectedListId.value);
    if (!list) return;

    const alert = await alertController.create({
        header: 'Renomear lista',
        inputs: [{ name: 'name', type: 'text', value: list.name }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Salvar', handler: async (data) => {
                    list.name = data.name;
                    const TaskService = (await import('@/services/TaskService')).TaskService;
                    const service = new TaskService();
                    await service.updateList(list);
                    await loadLists();
                }
            }
        ]
    });
    await alert.present();
}

async function deleteList() {
    if (!selectedListId.value) return;
    const alert = await alertController.create({
        header: 'Excluir lista',
        message: 'Deseja realmente excluir esta lista e todas as tarefas?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Excluir', role: 'destructive', handler: async () => {
                    const TaskService = (await import('@/services/TaskService')).TaskService;
                    const service = new TaskService();
                    await service.deleteList(selectedListId.value!);
                    selectedListId.value = lists.value[0]?.id;
                    await loadLists();
                    await loadTasks();
                }
            }
        ]
    });
    await alert.present();
}

watch(selectedListId, async (newVal) => {
    if (newVal) {
        await Preferences.set({ key: 'selectedListId', value: newVal.toString() });
    }
});

onMounted(async () => {
    const savedListId = await Preferences.get({ key: 'selectedListId' });
    if (savedListId.value) selectedListId.value = parseInt(savedListId.value);

    await loadLists();
    await loadTasks();

    // aguarda meio segundo e depois ativa
    setTimeout(() => {
        loadingTask.value = false;
    }, 500);
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
