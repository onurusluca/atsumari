import Navbar from '@/components/nav/dashboard/Navbar.vue';

<template>
  <Navbar />
  <Sidebar />
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
  margin: 5rem 1rem 0 6rem;
}
</style>
