<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

const emit = defineEmits(["closeModal"]);

onMounted(() => {});
</script>

<template>
  <div class="main-menu">
    <p>MainMenusas</p>
    <router-link :to="{ name: 'Home' }">Home</router-link>
  </div>
</template>

<style scoped lang="scss">
.main-menu {
  position: absolute;
  left: 1rem;
  bottom: 3.5rem; // height of bottom control

  width: 20rem;
  height: 30rem;
  background-color: var(--bg-300);
  border-radius: $borderRadius;
  border: 1px solid var(--border);

  box-shadow: 0px 0px 10px 3px rgba(0, 0, 0, 0.2);
}
</style>
