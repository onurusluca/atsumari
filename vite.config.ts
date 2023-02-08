import { fileURLToPath, URL } from "node:url";
import { resolve, dirname } from "node:path";
import path from "path";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";

import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Icons from "unplugin-icons/vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // vite config

    base: process.env.VITE_BASE_URL,

    resolve: {
      alias: {
        // Makes '@/' the src folder for easy import
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    server: {
      port: 5173,
    },
    build: { chunkSizeWarningLimit: 1000 },

    define: {
      __APP_ENV__: env.APP_ENV,
    },

    plugins: [
      vue({ include: [/\.vue$/] }),
      VueI18nPlugin({
        include: resolve(
          dirname(fileURLToPath(import.meta.url)),
          "./src/locales/**"
        ),
      }),
      Components({
        /* https://github.com/antfu/unplugin-vue-components */

        extensions: ["vue"],
        include: [/\.vue$/, /\.vue\?vue/],
        dts: "src/components.d.ts",
      }),
      AutoImport({
        /* https://github.com/antfu/unplugin-auto-import */

        imports: [
          "vue",
          "vue-router",
          "vue-i18n",
          "@vueuse/head",
          "@vueuse/core",
        ],
        dts: "src/auto-imports.d.ts",
        dirs: ["src/modules"],
      }),
      Icons({
        /* https://github.com/antfu/unplugin-icons */
      }),
      VueI18nPlugin({
        /* https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n */
        runtimeOnly: true,
        compositionOnly: true,
        fullInstall: true,
        defaultSFCLang: "yml",
        include: path.resolve(__dirname, "./src/locales/**"),
      }),

      // https://vitejs.dev/guide/build.html#chunking-strategy
      splitVendorChunkPlugin(),
    ],

    // Make all CSS global (https://vitejs.dev/config/#css-modules)
    /*  css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/main.scss";`,
        },
      },
    }, */
  };
});
