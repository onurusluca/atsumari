import BottomControl from '@/components/nav/room/BottomControl.vue';

<template>
  <router-view v-slot="{ Component }">
    <div class="content">
      <component :is="Component" />
    </div>
  </router-view>
  <BottomControl />
</template>

<style scoped lang="scss">
.content {
}
</style>
