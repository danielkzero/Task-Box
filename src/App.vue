<template>
  <ion-app mode="md">
    
    <ion-router-outlet />
    <!--<ion-page><ion-button @click="importDataFromJson(dadosConvertidos)">criar</ion-button></ion-page>-->
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import DadosExemplo from "@/db/DadosExemplo.json";
import { importDataFromJson } from "@/utils/importData";
const dadosConvertidos = {
  ...DadosExemplo,
  tasks: DadosExemplo.tasks.map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
    scheduledFor: new Date(t.scheduledFor)
  })),
  taskDetails: DadosExemplo.taskDetails.map(d => ({
    ...d,
    createdAt: new Date(d.createdAt),
  })),
};
//await importDataFromJson(dadosConvertidos);
</script>
<style>
/*
ion-header,
ion-toolbar,
ion-content {
  padding-top: var(--ion-safe-area-top, 0px);
}*/
</style>