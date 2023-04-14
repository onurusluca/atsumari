<script setup lang="ts">
const route = useRouter();
</script>

<template>
  <div class="navbar">
    <div class="navbar__left">
      <div class="left__space-name">
        {{ route.currentRoute.value.params.name }}
      </div>
    </div>
    <div class="navbar__right"> </div>
  </div>
</template>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 15rem;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem;
  height: 5rem;

  background-color: var(--bg-100);
  border-bottom: 1px solid var(--border);

  z-index: $navbar-z-index;

  .navbar__left {
    .left__space-name {
      font-size: 1.5rem;
      font-weight: 500;
    }
  }
  .navbar__right {
  }
}
</style>
