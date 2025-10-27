<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Task Box</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Sobre o Task Box</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            <strong>Task Box</strong> é um aplicativo para ajudar você a organizar suas tarefas diárias de forma simples e eficiente.
            Crie listas, adicione tarefas e receba lembretes no momento certo.
          </p>
          <p>Versão <strong>{{ appInfo.version }}</strong></p>
          <p>Desenvolvido com <strong>Ionic + Vue 3 + Dexie.js</strong></p>

          <hr style="margin: 1rem 0; opacity: 0.4;" />
          <p style="font-size: 0.9rem; color: #777;">
            Algumas imagens e ilustrações utilizadas neste aplicativo foram obtidas gratuitamente em
            <a href="https://www.freepik.com" target="_blank" rel="noopener noreferrer">Freepik</a>.
          </p>
        </ion-card-content>
      </ion-card>

      <!-- Notas de versão -->
      <ion-card style="margin-top: 1rem;">
        <ion-card-header>
          <ion-card-title>Notas de Versão</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-accordion-group>
            <ion-accordion v-for="(v, index) in sortedNotes" :key="v.id" :value="index > 0 ? v.id.toString() : undefined">
              <ion-item slot="header">
                <ion-label>
                  <h3>{{ v.versao }} <small style="color: #888;">({{ formatDate(v.createdAt) }})</small></h3>
                </ion-label>
              </ion-item>
              <div class="ion-padding" slot="content">
                <ul>
                  <li v-for="note in v.notas" :key="note">{{ note }}</li>
                </ul>
              </div>
            </ion-accordion>
          </ion-accordion-group>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { appInfo } from '@/config/appInfo';
import { versionNotes } from '@/config/versionNotes';
import { ref, computed } from 'vue';
import { formatDate } from '@/utils/formatDate';

const sortedNotes = computed(() => {
  return [...versionNotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

</script>
