import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from "@vueuse/head";
import App from "./App.vue";
import router from "./router";
import i18n from "./utils/i18n";

import "./assets/styles/main.scss";
const head = createHead();

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(createPinia());
app.use(head);

app.mount("#app");
