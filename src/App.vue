<script setup lang="ts">
import Dashboard from "./layouts/dashboardLayout.vue";
import NoLayout from "./layouts/noLayout.vue";
import SpaceSettingsLayout from "./layouts/spaceSettingsLayout.vue";

const router = useRouter();
const route = useRouter();
const authStore = useAuthStore();

const authLocalStorage = useStorage("atsumari_auth", {
  rememberMeCheckedLocal: null,
  tokenExpiry: 0,
});

let session = ref();
onMounted(async () => {
  /*   // if token is expired, refresh it
  if (authLocalStorage.value.tokenExpiry) {
    const tokenExpiry = authLocalStorage.value.tokenExpiry;
    const now = new Date();
    const expiryDate = new Date(tokenExpiry);
    if (now > expiryDate) {
      console.log("token expired");

      try {
        const { data, error } = await supabase.auth.refreshSession();

        console.log("token refreshed");

        if (error) {
          console.log(error);
          throw error;
        } else {
          authLocalStorage.value.tokenExpiry = data.expires_at;
        }
      } catch (error) {}
    }
  } */

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
      // Continue to the route
    }
  }
);

// Layout logic based on the route
// Dashboard and default usage(in-space) have different layouts
const layoutLogic = computed(() => {
  if (route.currentRoute.value.name === "Home") {
    return "dashboardLayout";
  } else if (route.currentRoute.value.path.includes("space-settings")) {
    return "spaceSettingsLayout";
  } else {
    return "no-layout";
  }
});
</script>

<template>
  <NoLayout v-if="layoutLogic === 'no-layout'" />
  <Dashboard v-if="layoutLogic === 'dashboardLayout'" />
  <SpaceSettingsLayout v-if="layoutLogic === 'spaceSettingsLayout'" />
</template>

<style lang="scss"></style>
