<script setup lang="ts">
import type SignInVue from '@/components/auth/SignIn.vue'
</script>

<template>
  <div class="login-view">
    <SignIn />
  </div>
</template>

<style scoped lang="scss">
.login-view {
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
