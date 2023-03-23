import BottomControl from '@/components/space/BottomControl.vue'; import BottomControl
from '@/components/space/BottomControl.vue'; import BottomControl from
'@/components/nav/space/BottomControl.vue';

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
