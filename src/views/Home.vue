<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const router = useRouter()

onMounted(async () => {})

// logout function
const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    console.log('signout')

    if (error) throw error
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<template>
  <router-link v-if="!authStore?.session?.user" :to="{ name: 'Register' }"
    >Register</router-link
  >
  <br />
  <router-link v-if="!authStore?.session?.user" :to="{ name: 'Login' }"
    >Login</router-link
  >
  <button
    className="p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500"
    @click="logOut"
    v-else
  >
    Sign Out
  </button>
  <div v-if="authStore?.session?.user">
    {{ authStore?.session?.user.email }}
  </div>
</template>

<style scoped lang="scss"></style>
