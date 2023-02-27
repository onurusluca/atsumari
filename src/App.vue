<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()

let session = ref()
const authStore = useAuthStore()

onMounted(async () => {
  // listen for auth events (e.g. sign in, sign out, refresh)
  // set session based on the auth event
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
    authStore.session = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
    authStore.session = _session
  })

  // if the user is already logged in, redirect to the dashboard else show the login page
  /*   if (authStore.session) {
    router.push({ name: 'Home' })
  } else {
    router.push({ name: 'Login' })
  } */
})
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
