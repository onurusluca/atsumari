<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'

let email = ref<string>('')
let password = ref<any>(null)
let passwordConfirm = ref<any>(null)
let errorUi = ref<string>('')
let showEmailVerification = ref<boolean>(false)

const register = async () => {
  if (password.value !== passwordConfirm.value) {
    errorUi.value = 'Passwords do not match'
    return
  } else {
    try {
      let { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (data) {
        showEmailVerification.value = true
      }
      if (error) throw error
      console.log('data', data)
      return
    } catch (error) {}
  }
}
</script>

<template>
  <router-link :to="{ name: 'Home' }">Home</router-link>
  <br />
  <h1>Register</h1>

  <div v-if="errorUi" class="">
    <h4>ERROR LOL :D</h4>
    <p>{{ errorUi }}</p>
  </div>

  <div v-if="showEmailVerification">
    Verify your email!
    <br />
    <br />
    <router-link class="button" :to="{ name: 'Home' }">I verified</router-link>
  </div>

  <form v-show="!showEmailVerification" @submit.prevent="register">
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" v-model="email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" v-model="password" />
    </div>
    <div>
      <label for="passwordConfirm">Confirm Password</label>
      <input type="password" id="passwordConfirm" v-model="passwordConfirm" />
    </div>
    <div>
      <button type="submit">Register</button>
    </div>

    <div>
      <router-link :to="{ name: 'Login' }">Login</router-link>
    </div>
  </form>
</template>

<style scoped lang="scss"></style>
