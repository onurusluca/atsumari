<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'
import { useAuthStore } from '@/stores/authStore'
import Dashboard from './layouts/dashboard.vue'

const router = useRouter()
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
/* if (authStore.session) {
  router.push({ name: 'Home' })
} else {
  router.push({ name: 'Login' })
} */
</script>

<template>
  <main>
    <Dashboard />
  </main>
</template>

<style lang="scss"></style>
