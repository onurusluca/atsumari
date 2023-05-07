<template>
  <Navbar />
  <Sidebar />
  <main class="content">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </main>

  <!--
    Don't use keep-alive for now, it's causing issues with loading async stuff
     <keep-alive>
        <component :is="Component" />
      </keep-alive>
   -->
</template>

<style scoped lang="scss">
.content {
  margin: 5rem 1rem 0 6rem;
  @include m-768 {
  }

  @include s-576 {
    margin: 4rem 0 0 0;
  }
}
</style>
