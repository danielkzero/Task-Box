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
                        <span v-if="task?.scheduledFor"> | Agendada: {{ formatDate(task?.scheduledFor) }}</span>
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
import { formatDate } from '@/utils/formatDate';

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
        buttons.push({
            text: 'Renomear',
            icon: 'create-outline',
            handler: () => renameTaskPrompt()
        });
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


async function renameTaskPrompt() {
    if (!task.value) return;

    const alert = await alertController.create({
        header: 'Renomear Tarefa',
        inputs: [{ name: 'title', type: 'text', value: task.value.title }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Salvar', handler: async (data) => {
                    task.value!.title = data.title;
                    await service.updateTask(task.value!);
                }
            }
        ]
    });
    await alert.present();
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

async function addDetailPrompt() {
    const alert = await alertController.create({
        header: 'Novo detalhe',
        inputs: [{ name: 'content', type: 'textarea', placeholder: 'Conteúdo', attributes: { rows: 5 } }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Adicionar', handler: async (data) => {
                    const detail = new TaskDetails(undefined, taskId, data.content, new Date());
                    await service.addTaskDetail(detail);
                    await loadDetails();
                }
            }
        ]
    });
    await alert.present();
}

async function editDetail(detail: TaskDetails) {
    const alert = await alertController.create({
        header: 'Editar detalhe',
        inputs: [{ name: 'content', type: 'textarea', value: detail.content, attributes: { rows: 5 } }],
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Salvar', handler: async (data) => {
                    detail.content = data.content;
                    await service.updateTaskDetail(detail);
                    await loadDetails();
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