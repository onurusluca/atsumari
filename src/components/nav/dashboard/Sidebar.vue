<script setup lang="ts"></script>

<template>
  <div class="sidebar"> </div>
</template>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  bottom: 0;
  top: 5rem;

  width: 6rem;
  height: 100%;
  padding: 0.3rem;
  padding-bottom: 7rem;

  border-right: 1px solid var(--border);

  z-index: $sidebar-z-index;

  @include m-768 {
  }

  @include s-576 {
    // Don't show sidebar on mobile
    display: none;
  }
}
</style>
