<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

let userSpaces = ref<Array<object>>([])

onMounted(async () => {
  await handleReadSpace()
})

/****************************************
 * API CALLS
 ****************************************/
// Logout
const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    console.log('signout')

    if (error) throw error
  } catch (error: any) {
    alert(error.message)
  }
}

const handleCreateSpace = async () => {
  try {
    const { data, error } = await supabase.from('spaces').insert([
      {
        name: 'My Space',
        user_id: authStore?.session?.user?.id,
      },
    ])
    if (error) throw error
    console.log('Space created!', data)
  } catch (error: any) {
    alert(error.message)
  }
}

const handleReadSpace = async () => {
  try {
    let { data: spaces, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('user_id', authStore?.session?.user?.id)
    if (spaces) {
      userSpaces.value.push(spaces)
    } else {
    }
    if (error) throw error
  } catch (error: any) {
    console.log('CATCH ERROR: ', error.message)
  }
}
</script>

<template>
  <div class="home"> </div>
  <!--   <router-link v-if="!authStore?.session?.user" :to="{ name: 'Register' }"
    >Register</router-link
  >
  <br />
  <router-link v-if="!authStore?.session?.user" :to="{ name: 'Login' }"
    >Login</router-link
  >
  <button className="btn" v-if="authStore?.session?.user" @click="logOut">
    Sign Out
  </button>

  <button
    className="p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500"
    @click="handleCreateSpace"
    v-if="authStore?.session?.user"
  >
    Create Space
  </button>
  <p>SPACES: {{ userSpaces }}</p>

  <div v-if="authStore?.session?.user">
    {{ authStore?.session?.user.email }}
  </div> -->
</template>

<style scoped lang="scss"></style>
