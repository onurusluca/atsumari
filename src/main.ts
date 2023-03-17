import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import i18n from "./utils/i18n";

import "./assets/styles/main.scss";

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(createPinia());

// Mount the app when router is ready: https://www.youtube.com/watch?v=a6gT6qHtch8&ab_channel=VueMastery
// This will prevent layout shift or and slow routing with auth guards
router.isReady().then(() => {
  app.mount("#app");
});
