<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});

//https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

const sendResetPasswordRequest = async () => {
  // Get the created space
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://example.com/update-password",
    });

    if (spaces) {
      userSpaces.value = spaces;
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ SPACE CATCH ERROR: ", error.message);
  }
};
</script>

<template>
  <div class="forgot-password"> </div>
</template>

<style scoped lang="scss">
.forgot-password {
}
</style>
