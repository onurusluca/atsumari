<template>
  <SpaceSettingsTopbar />
  <SpaceSettingsLeftbar />
  <main class="content">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>

<style scoped lang="scss">
.content {
  margin: 6rem 1rem 0 16rem;
  @include m-768 {
  }

  @include s-576 {
    margin: 4rem 0 0 0;
  }
}
</style>
