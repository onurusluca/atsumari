import { createI18n } from "vue-i18n";
import messages from "@intlify/unplugin-vue-i18n/messages";

export default createI18n({
  legacy: false, // Setting legacy: false enables the Composition API.
  locale: localStorage.getItem("lang") || "en", // Get locale from localStorage set in Navbar
  fallbackLocale: "en",
  globalInjection: true,
  availableLocales: ["en", "ja"],
  messages,
});

/*
Outside of component usage:

import i18n from "@/utils/i18n";
const { t } = i18n.global;
*/
