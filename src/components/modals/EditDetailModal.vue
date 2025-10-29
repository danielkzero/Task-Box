<template>
    <ion-modal :is-open="isOpen" @didDismiss="close">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ detail?.id ? 'Editar Detalhe' : 'Novo Detalhe' }}</ion-title>
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

            <ion-button expand="block" class="ion-margin-top" @click="save">
                {{ detail?.id ? 'Salvar' : 'Adicionar' }}
            </ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TaskDetails } from '@/models/TaskDetails'

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

watch(
    () => props.detail,
    (newVal) => {
        if (newVal) localDetail.value = { ...newVal }
    }
)

function close() {
    emits('update:isOpen', false)
}

function save() {
    emits('saved', { ...localDetail.value })
    close()
}
</script>
