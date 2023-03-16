<template>
  <router-view v-slot="{ Component }">
    <div class="content">
      <component :is="Component" />
    </div>
  </router-view>
</template>

<style scoped lang="scss">
.content {
}
</style>
