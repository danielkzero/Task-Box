<template>
    <ion-modal :is-open="isOpen" @didDismiss="close">
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    <ion-icon name="create-outline" v-if="detail?.id"></ion-icon>
                    <ion-icon name="newspaper-outline" v-else></ion-icon>

                    {{ detail?.id ? 'Editar Detalhe' : 'Novo Detalhe' }}
                    
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="close">Fechar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-item>
                <ion-label position="stacked">Conteúdo</ion-label>
                <ion-textarea v-model="localDetail.content" rows="5" placeholder="Digite o conteúdo..."></ion-textarea>
            </ion-item>

            <!-- aparece só se a task tem pai ou filhos -->
            <ion-item v-if="tasksUnicas.length > 1" lines="none">
                <ion-checkbox v-model="replicate" justify="start">
                    Replicar nas cópias
                </ion-checkbox>
            </ion-item>

            <ion-button expand="block" class="ion-margin-top" @click="save">
                {{ detail?.id ? 'Salvar' : 'Adicionar' }}
            </ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { TaskDetails } from '@/models/TaskDetails'
import { Task } from '@/models/Task'
import { TaskService } from "@/services/TaskService";

const service = new TaskService();

const props = defineProps<{
    isOpen: boolean
    detail: TaskDetails | null
    myTask: Task | null | undefined
}>()

const emits = defineEmits(['update:isOpen', 'saved'])

const localDetail = ref<TaskDetails>({
    ...props.detail,
    content: props.detail?.content ?? '',
    createdAt: props.detail?.createdAt as Date,
});

// ===== Estados auxiliares =====
const replicate = ref(false);
const relatedTasks = ref<any[]>([]); 
const tasksUnicas = ref<any[]>([]);

async function findParentAndChildren(task: Task) {
    const relatedTasks: any[] = [];
   
    if (!task) return relatedTasks; 

    // Adiciona a própria tarefa
    relatedTasks.push(task);

    // Se tiver pai, busca e adiciona
    if (task.idTaskParent) {
        const parent = await service.getTaskById(task.idTaskParent);
        if (parent) relatedTasks.push(parent);
    }

    // Busca filhos (se existirem)
    const children = await service.getTasksByParent(task.id!);
    if (children && children.length > 0) {
        relatedTasks.push(...children);
    }

    // Remove duplicados (por segurança)
    const uniqueTasks = relatedTasks.filter(
        (t, i, self) => i === self.findIndex((x) => x.id === t.id)
    );

    tasksUnicas.value = uniqueTasks;
}

watch(
    () => props.detail,
    (newVal) => {
        if (newVal) localDetail.value = { ...newVal }
    }
)
watch(
    async () => props.myTask,
    async () => {
        if (props.myTask) await findParentAndChildren(props.myTask);
    },
    { immediate: true }
)

onMounted(async () => {
    
});

function close() {
    emits('update:isOpen', false)
}

async function save() {
    if (!localDetail.value.content?.trim()) {
        // Evita salvar detalhe vazio
        return;
    }

    if (replicate.value && tasksUnicas.value.length > 0) {
        // Replicar em todas as tarefas relacionadas
        for (const task of tasksUnicas.value) {
            const detailCopy: TaskDetails = {
                ...localDetail.value,
                id: undefined, // garante novo registro
                taskId: task.id, // vincula à tarefa correta
                createdAt: new Date(),
            };
            await service.saveTaskDetail(detailCopy);
        }
    } else {
        // Salva só para a tarefa atual
        const detailCopy: TaskDetails = {
            ...localDetail.value,
            taskId: props.myTask?.id!,
            createdAt: new Date(),
        };
        await service.saveTaskDetail(detailCopy);
    }

    emits('saved'); // notifica o componente pai
    //emits('saved', { ...localDetail.value })
    close()
}
</script>
