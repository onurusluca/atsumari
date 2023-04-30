<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

const emit = defineEmits(["closeModal"]);

onMounted(() => {});
</script>

<template>
  <div class="main-menu">
    <section class="main-menu__top">
      <h5 class="top__space-name">{{ generalStore.spaceName }}</h5>

      <!-- Invite -->
    </section>
    <router-link :to="{ name: 'Home' }" class="main-menu__item">Home</router-link>
  </div>
</template>

<style scoped lang="scss">
.main-menu {
  position: absolute;
  left: 1rem;
  bottom: 3.5rem; // height of bottom control

  width: 20rem;
  height: 30rem;
  padding: 0.5rem 1rem;

  background-color: var(--bg-300);
  border-radius: $borderRadius;
  border: 1px solid var(--border);

  box-shadow: 0px 0px 10px 3px rgba(0, 0, 0, 0.2);

  .main-menu__item {
    display: block;
    padding: 1rem 0.5rem;
    text-decoration: none;
    transition: all 0.1s ease-in-out;
    font-weight: 600;

    &:hover {
      background-color: var(--bg-400);
    }
  }

  .main-menu__top {
    margin-bottom: 0.5rem;
    border-bottom: 2px solid var(--border-darker);

    .top__space-name {
      text-align: center;
      margin: 0;
      padding: 1rem 0.5rem;
      font-weight: 600;
    }
  }
}
</style>
