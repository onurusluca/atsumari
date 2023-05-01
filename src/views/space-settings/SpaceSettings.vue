<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

let spaceId = route.currentRoute.value.params;

onMounted(() => {});
</script>

<template>
  <div class="space-settings">
    <p>spaceSefdgdfttings</p>
    <p> {{ spaceId }} </p>
  </div>
</template>

<style scoped lang="scss">
.space-settings {
}
</style>
