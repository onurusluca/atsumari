<script setup lang="ts">
import type { SpacesType } from '@/api/Types'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

let userSpaces = ref<SpacesType[]>([])
onMounted(async () => {
  await handleReadSpace()
})

/****************************************
 * API CALLS
 ****************************************/

const handleReadSpace = async () => {
  try {
    let { data: spaces, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('user_id', authStore?.session?.user?.id)
    if (spaces) {
      userSpaces.value = spaces
      console.log('Space read!: ', spaces)
    } else {
    }
    if (error) throw error
  } catch (error: any) {
    console.log('READ SPACE CATCH ERROR: ', error.message)
  }
}

// Realtime
supabase
  .channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'spaces' },
    async () => {
      console.log('Spaces changed!')
      await handleReadSpace()
    }
  )
  .subscribe()
</script>

<template>
  <div class="home">
    <ul class="home__spaces" v-if="userSpaces.length > 0"
      ><li v-for="(item, index) in userSpaces" :key="index" class="spaces__space">
        <div class="space__top">
          <div class="top__title">{{ item.name }}</div>
          <div class="top__space-settings"></div>
        </div>
        <div class="space__image"> </div>
        <div class="space__bottom">
          <div class="bottom__online-count"></div>
          <div class="bottom__last-used"></div>
        </div> </li
    ></ul>
    <div v-else class="clp"> <div class="clp clp-place"></div> </div>
  </div>
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

<style scoped lang="scss">
.home {
  padding: 1rem;
  .home__spaces {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    .spaces__space {
      width: 30rem;
      min-width: 20rem;

      padding: 1rem;

      border: 1px solid var(--border);
      border-radius: $borderRadius;
    }
  }
}
</style>
