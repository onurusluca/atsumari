<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});
</script>

<template>
  <div class="space-access"> <h1> Access </h1> </div>
</template>

<style scoped lang="scss">
.space-access {
}
</style>
