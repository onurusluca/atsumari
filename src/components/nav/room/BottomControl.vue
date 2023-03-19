<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

let roomId = route.currentRoute.value.params;

onMounted(() => {});
</script>

<template>
  <div class="bottom-control"> </div>
</template>

<style scoped lang="scss">
.bottom-control {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  margin: 0;
  padding: 0;

  background-color: var(--bg-100);
  border-top: 1px solid var(--border);

  z-index: $room-bottom-control-z-index;
}
</style>
