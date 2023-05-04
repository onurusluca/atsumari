<script setup lang="ts">
import type { User } from "@/types/general";

const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

const props = defineProps({
  onlineUsers: {
    type: Array<User>,
    required: true,
  },
});
onMounted(() => {});
</script>

<template>
  <div class="online-users">
    <ul class="online-users__list">
      <li v-for="(user, index) in onlineUsers" :key="index" class="list__item">
        {{ user.userName }}</li
      >
    </ul>
  </div>
</template>

<style scoped lang="scss">
.online-users {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 3.5rem; // height of bottom control

  width: 25rem;
  background-color: var(--bg-200);
  border-left: 1px solid var(--border);
  box-shadow: 0px -20px 10px 3px rgba(0, 0, 0, 0.2);
  z-index: $space-sidebar-z-index;

  .online-users__list {
    height: 100%;
    padding: 1rem;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }

    .list__item {
      height: 3rem;
      padding: 0.5rem 1rem;

      display: flex;
      align-items: center;
      justify-content: space-between;

      background-color: var(--bg-300);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
  }
}
</style>
