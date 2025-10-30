import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import "@ionic/vue/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

// Componentes Ionic
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonBackButton,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
  IonFooter,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonModal,
  IonTextarea,
  IonSelectOption,
  IonSelect
} from "@ionic/vue";

// Ionic Icons
import { addIcons } from "ionicons";
import {
  chevronExpandOutline,
  ellipsisVerticalOutline,
  addOutline,
  informationCircleOutline,
  createOutline,
  trashOutline,
  closeOutline,
  checkmarkDoneOutline,
  listOutline,
  calendarOutline,
  alertCircleOutline,
  calendarNumberOutline,
  newspaperOutline
} from "ionicons/icons";

// Registra ícones globalmente
addIcons({
  "chevron-expand-outline": chevronExpandOutline,
  "ellipsis-vertical-outline": ellipsisVerticalOutline,
  "add-outline": addOutline,
  "information-circle-outline": informationCircleOutline,
  "create-outline": createOutline,
  "trash-outline": trashOutline,
  "close-outline": closeOutline,
  "checkmark-done-outline": checkmarkDoneOutline,
  "list-outline": listOutline,
  "calendar-outline": calendarOutline,
  "alert-circle-outline": alertCircleOutline,
  "calendar-number-outline": calendarNumberOutline,
  "newspaper-outline": newspaperOutline
});

// Notificações do capacitor

import { LocalNotifications } from "@capacitor/local-notifications";
async function requestNotificationPermission() {
  const result = await LocalNotifications.requestPermissions();
  if (result.display === "granted") {
    console.log("Permissão de notificação concedida");
  } else {
    console.warn("Permissão de notificação negada");
  }
}
requestNotificationPermission();

LocalNotifications.addListener(
  'localNotificationActionPerformed',
  (notification) => {
    const taskId = notification.notification.id;
    router.push(`/detalhes-tarefa/${taskId}`);
  }
);


const app = createApp(App)
  .use(IonicVue)
  .use(router)

  .component("IonPage", IonPage)
  .component("IonHeader", IonHeader)
  .component("IonToolbar", IonToolbar)
  .component("IonTitle", IonTitle)
  .component("IonContent", IonContent)
  .component("IonList", IonList)
  .component("IonItem", IonItem)
  .component("IonLabel", IonLabel)
  .component("IonInput", IonInput)
  .component("IonButton", IonButton)
  .component("IonButtons", IonButtons)
  .component("IonCheckbox", IonCheckbox)
  .component("IonFab", IonFab)
  .component("IonFabButton", IonFabButton)
  .component("IonIcon", IonIcon)
  .component("IonCard", IonCard)
  .component("IonBackButton", IonBackButton)
  .component("IonCardHeader", IonCardHeader)
  .component("IonCardTitle", IonCardTitle)
  .component("IonCardSubtitle", IonCardSubtitle)
  .component("IonCardContent", IonCardContent)
  .component("IonFooter", IonFooter)
  .component("IonAccordion", IonAccordion)
  .component("IonAccordionGroup", IonAccordionGroup)
  .component("IonBadge", IonBadge)
  .component("IonModal", IonModal)
  .component("IonTextarea", IonTextarea)
  .component("IonSelectOption", IonSelectOption)
  .component("IonSelect", IonSelect);

  

router.isReady().then(() => {
  app.mount("#app");
});
