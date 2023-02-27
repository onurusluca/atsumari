import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import path from 'path'
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config

    base: process.env.VITE_BASE_URL,

    resolve: {
      alias: {
        // Makes '@/' the src folder for easy import
        '@/': `${path.resolve(__dirname, 'src')}/`,
        //"@": fileURLToPath(new URL("./src", import.meta.url)),
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

      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: ['vue', 'vue-router', 'vue-i18n', '@vueuse/head', '@vueuse/core'],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/composables', 'src/stores', 'src/modules'],
      }),

      // https://github.com/antfu/unplugin-vue-components
      Components({
        // relative paths to the directory to search for components
        dirs: ['src/**/components'],
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue'],
        // search for subdirectories
        deep: true,
        dts: 'src/components.d.ts',
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      }),

      Icons({
        /* https://github.com/antfu/unplugin-icons */
      }),

      VueI18nPlugin({
        /* https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n */
        runtimeOnly: true,
        compositionOnly: true,
        include: [path.resolve(__dirname, './locales/**')],
      }),

      // https://vitejs.dev/guide/build.html#chunking-strategy
      splitVendorChunkPlugin(),
    ],

    optimizeDeps: {
      include: ['@vueuse/core', '@vueuse/head', 'vue', 'vue-router'],
    },
  }
})
