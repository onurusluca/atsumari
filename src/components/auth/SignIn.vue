<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'
import { useAuthStore } from '@/stores/authStore'
const router = useRouter()
const { t } = useI18n()

const authStore = useAuthStore()

const email = ref<string>('')
const password = ref<any>(null)

const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    router.push({ name: 'Home' })
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!--   <form @submit.prevent="handleLogin">
    <div>
      <input type="email" name="email" placeholder="email" v-model="email" required />
    </div>
    <div>
      <input
        type="password"
        placeholder="password"
        name="password"
        v-model="password"
        required
      />
    </div>
    <input
      type="submit"
      class="button block"
      :value="loading ? 'Loading' : 'Try to login'"
      :disabled="loading"
    />
  </form> -->

  <div id="login">
    <div class="login__top">
      <h1 class="auth__title">{{ t('auth.login.topTitle') }}</h1>
      <p class="auth__subtitle"></p>
    </div>
    <div class="login__oauth"> </div>
    <form class="login__form"> </form>
  </div>
</template>

<style scoped lang="scss"></style>
