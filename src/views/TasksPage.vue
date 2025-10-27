<template>

    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Task Box</ion-title>
            </ion-toolbar>

            <!-- Menu de listas fixo abaixo do toolbar -->
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
            <!-- Barra de Ações da Lista -->
            <ion-card v-if="lists.length > 0">
                <ion-item lines="none" style="padding-top: 0.25rem; padding-bottom: 0.25rem;">
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

                <!-- Lista de Tarefas -->
                <ion-list>
                    <ion-item v-for="t in sortedTasks" :key="t.id" lines="none">
                        <ion-checkbox slot="start" :checked="t.done" @ionChange.stop="toggle(t.id)"></ion-checkbox>
                        <ion-label @click="editTask(t)">
                            <h2 :style="{ textDecoration: t.done ? 'line-through' : 'none' }">{{ t.title }}</h2>
                            <small>
                                Criada: {{ formatDate(t.createdAt) }}
                                <span v-if="t.scheduledFor"> | Agendada: {{ formatDate(t.scheduledFor) }}</span>
                            </small>
                        </ion-label>
                    </ion-item>
                    <div v-if="sortedTasks.length === 0 && lists.length > 0"
                        style="padding: 10px; margin: 0; text-align: center;">
                        <img src="/9276414.jpg" alt="Sem tarefas"
                            style="max-width: 200px; width: 50%; opacity: 0.6; margin-bottom: 1rem;" />
                        <p style="font-size: 1rem; color: #666; font-weight: 500;">
                            Parece que essa lista está vazia...
                        </p>
                        <p style="font-size: 1rem; color: #666;">
                            Que tal criar sua primeira tarefa agora? <br>
                            Clique no <strong>+</strong> e comece a se organizar!
                        </p>
                        <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                            Dica: você pode adicionar datas e prioridades para se manter produtivo.
                        </p>
                    </div>
                </ion-list>
            </ion-card>
            <ion-card v-else>
                <!-- Lista de Tarefas -->
                <ion-list>
                    <div style="padding: 10px; margin: 0; text-align: center;">
                        <img src="/9276421.jpg" alt="Sem listas"
                            style="max-width: 200px; width: 50%; opacity: 0.6; margin-bottom: 1rem;" />
                        <p style="font-size: 1rem; color: #666; font-weight: 500;">
                            Você ainda não criou nenhuma lista!
                        </p>
                        <p style="font-size: 1rem; color: #666;">
                            Clique no <strong>+ Nova Lista</strong> para começar a organizar suas tarefas.
                        </p>
                        <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                            Dica: crie listas por projeto, tema ou prioridade para se manter focado.
                        </p>
                    </div>
                </ion-list>

            </ion-card>

            <!-- Botão flutuante para adicionar nova tarefa -->
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
    </ion-page>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { alertController, actionSheetController } from '@ionic/vue';

import { TaskService } from '@/services/TaskService';
import { Task } from '@/models/Task';
import { TaskList } from '@/models/TaskList';

const service = new TaskService();

const lists = ref<TaskList[]>([]);
const tasks = ref<Task[]>([]);

const selectedListId = ref<number | undefined>();
const sortMode = ref<'order' | 'date'>('order');

function selectList(id?: number) {
    if (!id) return;
    selectedListId.value = id;
    loadAll();
}


async function loadAll() {
    lists.value = await service.listLists();
    if (!selectedListId.value && lists.value.length > 0) selectedListId.value = lists.value[0].id;
    if (selectedListId.value) tasks.value = await service.listTasks(selectedListId.value);
}

const currentListName = computed(() => {
    const list = lists.value.find(l => l.id === selectedListId.value);
    return list ? list.name : 'Lista';
});

const sortedTasks = computed(() => {
    if (!tasks.value) return [];
    if (sortMode.value === 'date') {
        return [...tasks.value].sort((a, b) => (a.scheduledFor?.getTime() ?? 0) - (b.scheduledFor?.getTime() ?? 0));
    }
    return tasks.value; // ordem normal
});

async function newListPrompt() {
    const alert = await alertController.create({
        header: 'Nova Lista',
        inputs: [{ name: 'name', type: 'text', placeholder: 'Nome da lista' }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Criar', handler: async (data) => {
                    if (!data.name.trim()) return;
                    const id = await service.addList(new TaskList(undefined, data.name));
                    selectedListId.value = id;
                    await loadAll();
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
            { text: 'Minha ordem', handler: () => { sortMode.value = 'order'; } },
            { text: 'Data', handler: () => { sortMode.value = 'date'; } },
            { text: 'Cancelar', role: 'cancel' }
        ]
    });
    await sheet.present();
}

async function openListActionSheet() {
    const sheet = await actionSheetController.create({
        header: 'Ações da lista',
        buttons: [
            { text: 'Renomear lista', handler: () => renameList() },
            { text: 'Excluir lista', role: 'destructive', handler: () => deleteList() },
            { text: 'Excluir concluídas', handler: () => deleteCompleted() },
            { text: 'Cancelar', role: 'cancel' }
        ]
    });
    await sheet.present();
}

async function renameList() {
    if (!selectedListId.value) return;
    const current = lists.value.find(l => l.id === selectedListId.value);
    if (!current) return;
    const alert = await alertController.create({
        header: 'Renomear lista',
        inputs: [{ name: 'name', type: 'text', value: current.name }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Salvar', handler: async (data) => {
                    current.name = data.name;
                    await service.updateList(current);
                    await loadAll();
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
                    await service.deleteList(selectedListId.value!);
                    selectedListId.value = lists.value[0]?.id;
                    await loadAll();
                }
            }
        ]
    });
    await alert.present();
}

async function deleteCompleted() {
    if (!selectedListId.value) return;
    const alert = await alertController.create({
        header: 'Excluir concluídas',
        message: 'Deseja realmente excluir todas as tarefas concluídas desta lista?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Excluir', role: 'destructive', handler: async () => {
                    await service.deleteCompletedTasks(selectedListId.value!);
                    await loadAll();
                }
            }
        ]
    });
    await alert.present();
}

async function newTaskPrompt() {
    if (!selectedListId.value) return;
    const alert = await alertController.create({
        header: 'Nova Tarefa',
        inputs: [
            { name: 'title', type: 'text', placeholder: 'Título' },
            { name: 'date', type: 'date' }
        ],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Criar', handler: async (data) => {
                    const t = new Task(
                        undefined,
                        data.title,
                        false,
                        selectedListId.value,
                        new Date(),
                        data.date ? new Date(data.date) : undefined
                    );
                    await service.addTask(t);
                    await loadAll();
                }
            }
        ]
    });
    await alert.present();
}

async function toggle(id?: number) {
    if (!id) return;
    await service.toggleTask(id);
    await loadAll();
}

async function editTask(t: Task) {
    const alert = await alertController.create({
        header: 'Editar Tarefa',
        inputs: [
            { name: 'title', type: 'text', value: t.title },
            { name: 'date', type: 'date', value: t.scheduledFor ? new Date(t.scheduledFor).toISOString().split('T')[0] : '' }
        ],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Salvar', handler: async (data) => {
                    t.title = data.title;
                    t.scheduledFor = data.date ? new Date(data.date) : undefined;
                    await service.updateTask(t);
                    await loadAll();
                }
            }
        ]
    });
    await alert.present();
}

function formatDate(d?: Date) { return d ? new Date(d).toLocaleDateString('pt-BR') : ''; }

onMounted(loadAll);
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


.list-menu.sticky {
    position: sticky;
    top: 0;
}
</style>