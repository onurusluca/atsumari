<script setup lang="ts">
import Dashboard from './layouts/dashboard.vue'
import Default from './layouts/default.vue'
import NoLayout from './layouts/noLayout.vue'

const router = useRouter()
const route = useRouter()

const authStore = useAuthStore()

let session = ref()

onMounted(async () => {
  // listen for auth events (e.g. sign in, sign out, refresh)
  // set session based on the auth event
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
    authStore.session = data.session
    authStore.user = data.session?.user
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
    authStore.session = _session
    authStore.user = _session?.user
  })
})

// if the user is already logged in, redirect to the dashboard else show the login page
watch(
  () => authStore.session,
  (session) => {
    if (session) {
      router.push({ name: 'Home' })
    } else {
      router.push({ name: 'Login' })
    }
  }
)

// Layout logic based on the route
// Dashboard and default usage(in-room) have different layouts
const layoutLogic = computed(() => {
  if (
    route.currentRoute.value.name === 'Login' ||
    route.currentRoute.value.name === 'Register'
  ) {
    return 'no-layout'
  } else if (
    route.currentRoute.value.name === 'Home' ||
    route.currentRoute.value.name === 'Spaces'
  ) {
    return 'dashboard'
  } else if (route.currentRoute.value.path.includes('room')) {
    return 'default'
  }
})
</script>

<template>
  <NoLayout v-if="layoutLogic === 'no-layout'" />
  <Dashboard v-if="layoutLogic === 'dashboard'" />
  <Default v-if="layoutLogic === 'default'" />
</template>

<style lang="scss"></style>
