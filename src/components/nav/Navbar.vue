<script setup lang="ts">
import { supabase } from "@/lib/supabaseInit";
import { userSessionStore } from "@/stores/userSession";

onMounted(() => {});
</script>

<template>
  <template>
    <div>
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'Test' }">Protected</router-link>
    </div>
  </template>
</template>

<style lang="scss"></style>
