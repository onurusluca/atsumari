<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const route = useRouter()

let roomId = route.currentRoute.value.params
</script>

<template>
  <div class="room">
    <h3>dsfgsd</h3>
    <h1> {{ roomId }} </h1>
  </div>
</template>

<style scoped lang="scss">
.room {
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
