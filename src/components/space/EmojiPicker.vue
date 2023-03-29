<script setup lang="ts">
import { createPicker, NativeRenderer, i18n, lightTheme, darkTheme } from "picmo";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

let emojiPicker = ref<any>(null);

onMounted(() => {});
</script>

<template>
  <div class="login-view"> </div>
</template>

<style scoped lang="scss">
.login-view {
}
</style>
