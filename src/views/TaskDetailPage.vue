<!-- TaskDetailPage.vue -->
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Detalhes da Tarefa</ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="openTaskActions">
                        <ion-icon name="ellipsis-vertical-outline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-card>
                <ion-card-header>
                    <ion-card-title>
                        <span :style="{ textDecoration: task?.done ? 'line-through' : 'none' }">{{ task?.title }}</span>
                    </ion-card-title>
                    <ion-card-subtitle>
                        Criada: {{ formatDate(task?.createdAt) }}
                        <span v-if="task?.scheduledFor"> | Agendada: {{ formatDateTime(task?.scheduledFor) }}</span>
                    </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                    <ion-list>
                        <ion-item v-for="detail in details" :key="detail.id">
                            <ion-label>
                                <span :style="{ textDecoration: task?.done ? 'line-through' : 'none' }">{{
                                    detail.content }}</span>
                            </ion-label>
                            <ion-button fill="clear" slot="end" class="top-end-button"
                                @click="openDetailActions(detail)" v-if="!task?.done">
                                <ion-icon name="ellipsis-vertical-outline"></ion-icon>
                            </ion-button>
                        </ion-item>

                    </ion-list>

                    <ion-item button @click="addDetailPrompt" lines="none" v-if="!task?.done">
                        <ion-label>
                            <ion-icon name="add-outline"></ion-icon>
                            Adicionar detalhe
                        </ion-label>
                    </ion-item>
                </ion-card-content>
            </ion-card>
        </ion-content>

        <EditTaskModal v-model:isOpen="isEditTaskOpen" :task="task" @saved="handleTaskSave" />

        <EditDetailModal v-model:isOpen="isDetailModalOpen" :detail="selectedDetail" @saved="handleDetailSave" />

        <ReagendarTaskModal v-model:isOpen="isReagendarModelOpen" :task="task" @saved="handleTaskSave" />
    </ion-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { alertController } from '@ionic/vue';
import { TaskService } from '@/services/TaskService';
import { Task } from '@/models/Task';
import { TaskDetails } from '@/models/TaskDetails';
import { actionSheetController } from '@ionic/vue';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import moment from 'moment';


import EditTaskModal from '@/components/modals/EditTaskModal.vue'
import EditDetailModal from '@/components/modals/EditDetailModal.vue'
import ReagendarTaskModal from '@/components/modals/ReagendarTaskModal.vue';

const isEditTaskOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedDetail = ref<TaskDetails | null>(null)

// Abrir modal para reagendamento de tarefa
const isReagendarModelOpen = ref(false)



const route = useRoute();
const router = useRouter();
const service = new TaskService();

const taskId = Number(route.params.id);
const task = ref<Task>();
const details = ref<TaskDetails[]>([]);


async function loadTask() {
    task.value = await service.db.tasks.get(taskId);
}

async function loadDetails() {
    details.value = await service.listTaskDetails(taskId);
}

async function openTaskActions() {
    let buttons: any[] = [];

    // Mostra "Renomear" apenas se a tarefa NÃO estiver concluída
    if (!task.value?.done) {

        buttons.push(
            {
                text: 'Reagendar',
                icon: 'calendar-number-outline',
                handler: () => editScheduledFor()
            },
            {
                text: 'Editar',
                icon: 'create-outline',
                handler: () => editTaskPrompt()
            },
        );
    }

    // Sempre adiciona "Excluir" e "Cancelar"
    buttons.push(
        {
            text: 'Excluir',
            icon: 'trash-outline',
            role: 'destructive',
            handler: () => deleteTask()
        },
        {
            text: 'Cancelar',
            icon: 'close-outline',
            role: 'cancel'
        }
    );
    const actionSheet = await actionSheetController.create({
        header: 'Ações da Tarefa',
        buttons
    });
    await actionSheet.present();
}


function editTaskPrompt() {
    isEditTaskOpen.value = true
}

async function handleTaskSave(updated: Task) {
    if (!updated) return
    await service.updateTask(updated)
    task.value = updated
}

function addDetailPrompt() {
    selectedDetail.value = new TaskDetails(undefined, taskId, '', new Date())
    isDetailModalOpen.value = true
}

function editDetail(detail: TaskDetails) {
    selectedDetail.value = detail
    isDetailModalOpen.value = true
}
// Reagendamento de tarefa
async function editScheduledFor() {
    isReagendarModelOpen.value = true
}

async function handleDetailSave(detail: TaskDetails) {
    if (detail.id) {
        await service.updateTaskDetail(detail)
    } else {
        await service.addTaskDetail(detail)
    }
    await loadDetails()
}

async function openDetailActions(detail: TaskDetails) {
    const actionSheet = await actionSheetController.create({
        header: 'Ações do detalhe',
        buttons: [
            {
                text: 'Editar',
                icon: 'create-outline',
                handler: () => editDetail(detail)
            },
            {
                text: 'Excluir',
                icon: 'trash-outline',
                role: 'destructive',
                handler: () => deleteDetail(detail.id!)
            },
            {
                text: 'Cancelar',
                icon: 'close-outline',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
}

async function deleteTask() {
    if (!task.value) return;

    const alert = await alertController.create({
        header: 'Excluir Tarefa',
        message: 'Deseja realmente excluir esta tarefa?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Excluir', role: 'destructive', handler: async () => {
                    await service.deleteTask(task.value!.id!);
                    router.back();
                }
            }
        ]
    });
    await alert.present();
}


async function deleteDetail(id: number) {
    await service.deleteTaskDetail(id);
    await loadDetails();
}

onMounted(async () => {
    await loadTask();
    await loadDetails();
});
</script>
<style scope>
.top-end-button {
    align-self: flex-start;
    /* força o botão a ficar no topo */
    --padding-start: 0;
    --padding-end: 0;
}
</style>