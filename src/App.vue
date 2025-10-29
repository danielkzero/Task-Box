<template>
  <ion-app mode="md">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';

</script>
<style>
ion-header,
ion-toolbar,
ion-content {
  padding-top: var(--ion-safe-area-top, 0px);
}
</style>