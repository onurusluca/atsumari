<script setup lang="ts">
import { handleLogin } from "@/composables/useAuth";

const email = ref<string>("");
const password = ref<any>(null);

const loading = ref(false);
async function onLogin() {
  await handleLogin(email.value, password.value);
}
</script>

<template>
  <h1>AUTH BOY!</h1>

  <form @submit.prevent="onLogin">
    <div>
      <input
        type="email"
        name="email"
        placeholder="email"
        v-model="email"
        required
      />
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
  </form>
</template>

<style scoped lang="scss"></style>
