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

                <!-- ======== AVISAR QUANTOS MINUTOS ANTES ======== -->
                <ion-item lines="none">
                    <ion-label position="stacked">Avisar quantos minutos antes?</ion-label>
                </ion-item>

                <div class="option-buttons">
                    <ion-button v-for="option in remindOptions" :key="option.value"
                        :fill="form.remindBefore === option.value ? 'solid' : 'outline'" color="primary" shape="round"
                        @click="selectRemind(option)">
                        {{ option.label }}
                    </ion-button>
                </div>

                <ion-item v-if="form.remindBefore === -1">
                    <ion-label position="stacked">Personalizar (minutos)</ion-label>
                    <ion-input v-model.number="customRemind" type="number" placeholder="Digite os minutos"
                        inputmode="numeric" />
                </ion-item>
            </ion-list>

            <ion-button expand="block" class="ion-margin-top" @click="saveTask">
                Salvar
            </ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Task } from '@/models/Task'
import moment from 'moment'

const props = defineProps<{ isOpen: boolean; task: Task | null | undefined }>()
const emits = defineEmits(['update:isOpen', 'saved'])

const remindOptions = [
    { label: '30 minutos antes', value: 30 },
    { label: '15 minutos antes', value: 15 },
    { label: '5 minutos antes', value: 5 },
    { label: 'Personalizar', value: -1 },
]

const form = ref({
    date: '',
    time: '',
    remindBefore: 15,
})

const customRemind = ref<number | null>(null)

function selectRemind(option: any) {
    form.value.remindBefore = option.value
}

watch(
    () => props.task,
    (task) => {
        if (task) {
            const scheduled = task.scheduledFor ? moment(task.scheduledFor) : null
            form.value = {
                date: scheduled ? scheduled.format('YYYY-MM-DD') : '',
                time: scheduled ? scheduled.format('HH:mm') : '',
                remindBefore: task.remindBefore ?? 15,
            }
            customRemind.value = task.remindBefore ?? 15
        }
    },
    { immediate: true }
)

const close = () => emits('update:isOpen', false)

async function saveTask() {
    if (!props.task) return

    const updated: Task = { ...props.task }

    if (form.value.date) {
        updated.scheduledFor = moment(`${form.value.date} ${form.value.time || '00:00'}`).toDate()
    } else {
        updated.scheduledFor = undefined
    }

    updated.remindBefore =
        form.value.remindBefore === -1 ? customRemind.value || 15 : form.value.remindBefore

    emits('saved', updated)
    close()
}
</script>

<style scoped>
.option-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0 0.8rem 0;
    justify-content: space-between;
}
</style>
