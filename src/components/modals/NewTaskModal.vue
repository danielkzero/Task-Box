<template>
    <ion-modal :is-open="isOpen" @didDismiss="close">
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>
                    <ion-icon name="newspaper-outline"></ion-icon>
                    Nova Tarefa
                </ion-title>
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

                <!-- ======== REPETIÇÃO ======== -->
                <ion-item lines="none">
                    <ion-label position="stacked">Repetir tarefa?</ion-label>
                </ion-item>

                <div class="option-buttons">
                    <ion-button :fill="form.repeatEnabled === 'no' ? 'solid' : 'outline'" color="medium" shape="round"
                        @click="form.repeatEnabled = 'no'">
                        Não
                    </ion-button>
                    <ion-button :fill="form.repeatEnabled === 'yes' ? 'solid' : 'outline'" color="primary" shape="round"
                        @click="form.repeatEnabled = 'yes'">
                        Sim
                    </ion-button>
                </div>

                <transition name="fade">
                    <div v-if="form.repeatEnabled === 'yes'" class="repeat-section">
                        <ion-item lines="none">
                            <ion-label position="stacked">Tipo de repetição</ion-label>
                        </ion-item>

                        <div class="option-buttons">
                            <ion-button v-for="option in repeatTypes" :key="option.value"
                                :fill="form.repeatType === option.value ? 'solid' : 'outline'" color="primary"
                                shape="round" @click="form.repeatType = option.value">
                                {{ option.label }}
                            </ion-button>
                        </div>

                        <ion-item>
                            <ion-label position="stacked">Repetir até</ion-label>
                            <ion-input v-model="form.repeatUntil" type="date" />
                        </ion-item>
                    </div>
                </transition>
            </ion-list>

            <ion-button expand="block" @click="createTask">Criar</ion-button>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Task } from "@/models/Task";
import moment from "moment";

const props = defineProps<{ isOpen: boolean; selectedListId: number | undefined }>();
const emits = defineEmits(["update:isOpen", "created"]);

const remindOptions = [
    { label: "30 minutos antes", value: 30 },
    { label: "15 minutos antes", value: 15 },
    { label: "5 minutos antes", value: 5 },
    { label: "Personalizar", value: -1 },
];

const repeatTypes = [
    { label: "Diariamente", value: "daily" },
    { label: "Semanalmente", value: "weekly" },
    { label: "Mensalmente", value: "monthly" },
];

const form = ref({
    title: "",
    date: "",
    time: "",
    remindBefore: 15,
    repeatEnabled: "no",
    repeatType: "",
    repeatUntil: "",
});

const customRemind = ref<number | null>(null);

function selectRemind(option: any) {
    form.value.remindBefore = option.value;
}

const close = () => emits("update:isOpen", false);

async function createTask() {
    if (!props.selectedListId || !form.value.title.trim()) return;

    const remindValue =
        form.value.remindBefore === -1 ? customRemind.value || 15 : form.value.remindBefore;

    const baseDate = form.value.date
        ? moment(`${form.value.date} ${form.value.time || "00:00"}`)
        : moment();

    // === Cria tarefa principal ===
    const mainTask = new Task(
        undefined,
        form.value.title.trim(),
        false,
        props.selectedListId,
        moment().toDate(),
        baseDate.toDate()
    );

    mainTask.remindBefore = remindValue;

    let taskCopies: Task[] = [];

    // === Se repetição estiver ativada, gera cópias ===
    if (form.value.repeatEnabled === "yes") {
        const repeatType = form.value.repeatType as "daily" | "weekly" | "monthly" | undefined;
        const repeatUntil = form.value.repeatUntil ? moment(form.value.repeatUntil) : null;

        if (repeatType && repeatUntil && baseDate.isBefore(repeatUntil)) {
            let nextDate = baseDate.clone().add(1, repeatType === "daily" ? "day" : repeatType === "weekly" ? "week" : "month");

            while (nextDate.isSameOrBefore(repeatUntil)) {
                const copy = new Task(
                    undefined,
                    mainTask.title,
                    false,
                    mainTask.listId,
                    moment().toDate(),
                    nextDate.toDate()
                );
                copy.remindBefore = mainTask.remindBefore;
                copy.idTaskParent = undefined; // será definido depois pelo service (id da principal)
                taskCopies.push(copy);
                nextDate.add(1, repeatType === "daily" ? "day" : repeatType === "weekly" ? "week" : "month");
            }
        }
    }

    emits("created", { task: mainTask, copies: taskCopies });
    close();
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

.repeat-section {
    margin-top: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
