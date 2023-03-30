<script setup lang="ts">
import Dashboard from "./layouts/dashboard.vue";
import NoLayout from "./layouts/noLayout.vue";

const router = useRouter();
const route = useRouter();
const authStore = useAuthStore();

let session = ref();

onMounted(async () => {
  // listen for auth events (e.g. sign in, sign out, refresh)
  // set session based on the auth event
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    authStore.session = data.session;
    authStore.user = data.session?.user;
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session;
    authStore.session = _session;
    authStore.user = _session?.user;
  });
});

// If the user is not logged in, redirect to login page
watch(
  () => session.value,
  (session) => {
    if (!session && route.currentRoute.value.name !== "Space") {
      router.push({ name: "Login" });
    } else {
      //router.push({ name: "Home" });
    }
  }
);

// Layout logic based on the route
// Dashboard and default usage(in-space) have different layouts
const layoutLogic = computed(() => {
  if (session && route.currentRoute.value.path === "/") {
    return "dashboard";
  } else {
    return "no-layout";
  }
});
</script>

<template>
  <NoLayout v-if="layoutLogic === 'no-layout'" />
  <Dashboard v-if="layoutLogic === 'dashboard'" />
</template>

<style lang="scss"></style>
