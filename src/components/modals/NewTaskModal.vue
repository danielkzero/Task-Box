<template>
    <ion-modal :is-open="isOpen" @didDismiss="close">
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Nova Tarefa</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="close">Fechar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-list>
                <ion-item>
                    <ion-label position="stacked">Título</ion-label>
                    <ion-input v-model="form.title" placeholder="Digite o título da tarefa" />
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Data</ion-label>
                    <ion-input v-model="form.date" type="date" />
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Hora</ion-label>
                    <ion-input v-model="form.time" type="time" />
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Avisar quantos minutos antes?</ion-label>
                    <ion-input v-model.number="form.remindBefore" type="number" placeholder="15" />
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Repetir a cada (minutos)</ion-label>
                    <ion-input v-model.number="form.repeatEvery" type="number" placeholder="0" />
                </ion-item>
            </ion-list>

            <ion-button expand="block" @click="createTask">Criar</ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Task } from '@/models/Task'
import moment from 'moment'

const props = defineProps<{ isOpen: boolean; selectedListId: number | undefined }>()
const emits = defineEmits(['update:isOpen', 'created'])

const form = ref({
    title: '',
    date: '',
    time: '',
    remindBefore: 15,
    repeatEvery: 0
})

const close = () => emits('update:isOpen', false)

async function createTask() {
    if (!props.selectedListId || !form.value.title.trim()) return

    const scheduledDate = form.value.date
        ? moment(`${form.value.date} ${form.value.time || '00:00'}`).toDate()
        : undefined

    const t = new Task(
        undefined,
        form.value.title,
        false,
        props.selectedListId,
        moment(new Date()).toDate(),
        scheduledDate
    )

    emits('created', t)
    close()
}
</script>
