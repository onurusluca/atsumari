<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});
</script>

<template>
  <div class="delete-shutdown"> <h1> Delete </h1> </div>
</template>

<style scoped lang="scss">
.delete-shutdown {
}
</style>
