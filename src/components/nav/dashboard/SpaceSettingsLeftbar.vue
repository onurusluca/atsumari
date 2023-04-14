<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();
const router = useRouter();

let routeName = ref(route.currentRoute.value.name);
const spaceId = route.currentRoute.value.params.id;
const spaceName = route.currentRoute.value.params.name;

watch(
  () => route.currentRoute.value.name,
  (newVal) => {
    routeName.value = newVal;
  }
);
</script>

<template>
  <div class="leftbar">
    <h6 class="leftbar__title">{{ t("spaceSettings.title") }}</h6>

    <ul class="leftbar__links">
      <li
        @click="
          router.push({
            name: 'SpaceSettings',
            params: { id: spaceId, name: spaceName },
          })
        "
        class="links__link"
        :class="routeName === 'SpaceSettings' ? 'links__link--active' : ''"
        ><ph:gear-six-fill class="mr-xs" />{{ t("spaceSettings.links.general") }}</li
      >

      <!-- Access -->
      <li
        @click="
          router.push({
            name: 'Access',
            params: { id: String(spaceId), name: spaceName },
          })
        "
        class="links__link"
        :class="routeName === 'Access' ? 'links__link--active' : ''"
        ><ph:lock-fill class="mr-xs" />{{ t("spaceSettings.links.access") }}</li
      >

      <li
        @click="
          router.push({
            name: 'DeleteShutdown',
            params: { id: String(spaceId), name: spaceName },
          })
        "
        class="links__link"
        :class="routeName === 'DeleteShutdown' ? 'links__link--active' : ''"
        ><ph:trash-fill class="mr-xs" />{{
          t("spaceSettings.links.deleteShutdown")
        }}</li
      >
    </ul>
  </div>
</template>

<style scoped lang="scss">
.leftbar {
  position: fixed;
  left: 0;
  bottom: 0;
  top: 0;

  width: 15rem;
  height: 100%;
  padding: 0.3rem;
  padding-bottom: 7rem;

  background-color: var(--bg-200);
  border-right: 1px solid var(--border);

  z-index: $sidebar-z-index;

  .leftbar__title {
    margin: 1rem 0 0 0.5rem;
  }

  .leftbar__links {
    margin-top: 1rem;
    list-style: none;
    padding: 0;

    .links__link {
      display: flex;
      align-items: center;

      padding: 0.5rem 0.5rem 0.5rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;

      font-weight: 600;

      cursor: pointer;

      &:hover {
        background-color: var(--bg-300);
      }
    }
    .links__link--active {
      background-color: var(--active-route-link-bg);
    }
  }

  @include m-768 {
  }

  @include s-576 {
    // Don't show sidebar on mobile
    display: none;
  }
}
</style>
