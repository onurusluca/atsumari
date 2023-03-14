<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const route = useRouter()

let roomId = route.currentRoute.value.params

onMounted(() => {})
</script>

<template>
  <div class="space-settings">
    <p>spaceSettings</p>
    <p> {{ roomId }} </p>
  </div>
</template>

<style scoped lang="scss">
.space-settings {
  display: flex;
  align-items: center;
  justify-content: center;

  #main-canvas {
    border: 1px solid blue;
  }
}
</style>
