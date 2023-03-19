<script setup lang="ts"></script>

<template>
  <h1 class="animate-spin">Loading!</h1>
</template>

<style scoped lang="scss">
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
