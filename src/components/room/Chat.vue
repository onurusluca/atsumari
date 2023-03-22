<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

onMounted(() => {});
</script>

<template>
  <div class="chat">
    <h1>CHAT</h1>
  </div>
</template>

<style scoped lang="scss">
.chat {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 4rem; // height of bottom control

  width: 25rem;
  background-color: var(--bg-300);
}
</style>
