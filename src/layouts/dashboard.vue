import Navbar from '@/components/nav/dashboard/Navbar.vue';

<template>
  <Navbar />
  <Sidebar />
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
