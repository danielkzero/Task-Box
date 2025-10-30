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
            <ion-item v-if="relatedTasks.length > 0" lines="none">
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
import { TaskService } from "@/services/TaskService";

const service = new TaskService();

const props = defineProps<{
    isOpen: boolean
    detail: TaskDetails | null
}>()

const emits = defineEmits(['update:isOpen', 'saved'])

const localDetail = ref<TaskDetails>({
    ...props.detail,
    content: props.detail?.content ?? '',
    createdAt: props.detail?.createdAt as Date,
});

// ===== Estados auxiliares =====
const replicate = ref(false);
const relatedTasks = ref<any[]>([]); // aqui guardamos pai + filhos (quando existirem)

async function findParentAndChildren(taskId: number) {
    const relatedTasks: any[] = [];
console.log('id' + taskId)
    const task = await service.getTaskById(taskId);
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

    return uniqueTasks;
}

watch(
    () => props.detail,
    (newVal) => {
        if (newVal) localDetail.value = { ...newVal }
    }
)

onMounted(async () => {
    if (props.detail?.id) await findParentAndChildren(props.detail?.id);
});

function close() {
    emits('update:isOpen', false)
}

function save() {
    emits('saved', { ...localDetail.value })
    close()
}
</script>
