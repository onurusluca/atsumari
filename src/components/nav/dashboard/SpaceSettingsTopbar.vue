<script setup lang="ts">
import { slugify } from "@/utils/slugify";

const { t } = useI18n();
const route = useRouter();

const spaceId = String(route.currentRoute.value.params.id);
const spaceName = String(route.currentRoute.value.params.name);
</script>

<template>
  <div class="navbar">
    <div class="navbar__left">
      <div class="left__space-name">
        {{ route.currentRoute.value.params.name }}
      </div>
    </div>
    <div class="navbar__right">
      <router-link
        class="btn btn-save"
        :to="{
          name: 'Space',
          params: {
            id: spaceId,
            name: slugify(spaceName),
          },
        }"
      >
        {{ t("spaces.enterSpace") }}
        <ion:enter-outline class="ml-s" />
      </router-link>
      <button class="btn btn-upgrade">
        <ri:vip-crown-2-line class="mr-s" />
        {{ t("buttons.upgrade") }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 15rem;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem;
  height: 5rem;

  background-color: var(--bg-100);
  border-bottom: 1px solid var(--border);

  z-index: $navbar-z-index;

  .navbar__left {
    .left__space-name {
      font-size: 1.5rem;
      font-weight: 500;
    }
  }
  .navbar__right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
</style>
