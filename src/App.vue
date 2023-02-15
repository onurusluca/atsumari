<script setup lang="ts">
import { supabase } from "@/lib/supabaseInit";
import { userSessionStore } from "@/stores/userSession";

// initialize the userSession store
const userSession = userSessionStore();

// listen for auth events (e.g. sign in, sign out, refresh)
// set session based on the auth event
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event);
  userSession.session = session;
});

onMounted(() => {});
</script>

<template>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>

<style lang="scss"></style>
