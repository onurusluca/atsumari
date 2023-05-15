<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});
</script>

<template>
  <div class="space-settings-modal">
    <!-- TODO: add a brightness setting -->
  </div>
</template>

<style scoped lang="scss">
.space-settings-modal {
}
</style>
