import path from "path";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";

import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Icons from "unplugin-icons/vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import IconsResolver from "unplugin-icons/resolver";

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
        "@/": `${path.resolve(__dirname, "src")}/`,
        //"@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    server: {
      port: 5173,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ["phaser"],
          },
        },
      },
    },
    define: {
      __APP_ENV__: env.APP_ENV,
    },

    css: {
      preprocessorOptions: {
        scss: {
          // We need to import the variables and mixins here so that they are available in the global scope
          additionalData: `@import "./src/assets/styles/_z-index.scss"; @import "./src/assets/styles/_variables.scss"; @import "./src/assets/styles/_mixins.scss"; @import "./src/assets/styles/_media-queries.scss";`,
        },
      },
    },

    plugins: [
      vue({ include: [/\.vue$/] }),

      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "vue-i18n",
          "@vueuse/head",
          "@vueuse/core",
          { "/src/utils/supabaseInit": ["supabase"] },
        ],
        dts: "src/auto-imports.d.ts",
        dirs: ["src/composables", "src/stores", "src/modules"],
      }),

      // https://github.com/antfu/unplugin-vue-components
      Components({
        // relative paths to the directory to search for components
        dirs: ["src/**/components"],
        // allow auto load markdown components under `./src/components/`
        extensions: ["vue"],
        // search for subdirectories
        deep: true,
        dts: "src/components.d.ts",
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          // auto import icons
          // https://github.com/antfu/unplugin-icons#auto-importing
          IconsResolver({
            prefix: false,
            // Import icons from this collection https://icon-sets.iconify.design
            // Easy icon finding: https://icones.netlify.app/

            // TODO: Use less icon sets
            enabledCollections: [
              "carbon",
              "ph",
              "logos",
              "ri",
              "teenyicons",
              "svg-spinners",
              "gridicons",
              "radix-icons",
              "fluent-emoji",
              "ion",
              "fluent-emoji-flat",
            ],
          }),
        ],
      }),

      Icons({
        autoInstall: true,
        /* https://github.com/antfu/unplugin-icons */
      }),

      VueI18nPlugin({
        /* https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n */
        runtimeOnly: true,
        compositionOnly: true,
        include: [path.resolve(__dirname, "./locales/**")],
      }),

      // https://vitejs.dev/guide/build.html#chunking-strategy
      splitVendorChunkPlugin(),
    ],

    optimizeDeps: {
      include: ["@vueuse/core", "@vueuse/head", "vue", "vue-router"],
    },
  };
});
