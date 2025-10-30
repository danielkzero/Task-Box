<template>
    <ion-modal :is-open="isOpen" @didDismiss="close">
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>
                    <ion-icon name="calendar-number-outline"></ion-icon>
                    Reagendar Tarefa
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="close">Fechar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-list>
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
                    <ion-input v-model.number="form.remindBefore" type="number" placeholder="15" inputmode="numeric" pattern="[0-9]" />
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Repetir a cada (minutos)</ion-label>
                    <ion-input v-model.number="form.repeatEvery" type="number" placeholder="0" inputmode="numeric" pattern="[0-9]" />
                </ion-item>
            </ion-list>

            <ion-button expand="block" @click="saveTask">Salvar</ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Task } from '@/models/Task'
import moment from 'moment'

const props = defineProps<{ isOpen: boolean; task: Task | null | undefined }>()
const emits = defineEmits(['update:isOpen', 'saved'])

const form = ref({
    title: '',
    date: '',
    time: '',
    remindBefore: 15,
    repeatEvery: 0,
})

// Atualiza formulário quando o modal abre com tarefa existente
watch(
    () => props.task,
    (task) => {
        if (task) {
            const scheduled = task.scheduledFor ? moment(task.scheduledFor) : null
            form.value = {
                title: task.title,
                date: scheduled ? scheduled.format('YYYY-MM-DD') : '',
                time: scheduled ? scheduled.format('HH:mm') : '',
                remindBefore: 15,
                repeatEvery: 0,
            }
        }
    },
    { immediate: true }
)

const close = () => emits('update:isOpen', false)

async function saveTask() {
    if (!props.task || !form.value.title.trim()) return

    const updated = { ...props.task }
    updated.title = form.value.title

    if (form.value.date) {
        updated.scheduledFor = moment(`${form.value.date} ${form.value.time || '00:00'}`).toDate()
    } else {
        updated.scheduledFor = undefined
    }

    emits('saved', updated)
    close()
}
</script>
