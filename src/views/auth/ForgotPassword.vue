<script setup lang="ts">
const { t } = useI18n();
const route = useRouter();

let isNewPassword = route.currentRoute.value.query.new_password;
let emailToResetPassword = route.currentRoute.value.query.email;

let email = ref<string>("");
let password = ref<any>(null);
let loading = ref<boolean>(false);
let emailSent = ref<boolean>(false);

onMounted(() => {});

//https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
const sendResetPasswordRequest = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
      // send query param to redirect to new password page
      redirectTo: "/forgot-password?new_password=true?email=" + email.value,
    });

    if (data) {
      console.log("SEND RESET PASSWORD EMAIL DATA: ", data);
      loading.value = false;
      emailSent.value = true;
    }
    if (error) throw error;
  } catch (error: any) {
    console.error("SEND RESET PASSWORD EMAIL ERROR ", error);
  }
};

const resetPassword = async () => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: password.value,
    });

    if (data) {
      console.log("RESET PASSWORD DATA: ", data);
    }
    if (error) throw error;
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR ", error);
  }
};

// Reveal password button
let revealPasswordButtonRef = ref<HTMLElement>();
const { pressed } = useMousePressed({ target: revealPasswordButtonRef });
</script>

<template>
  <div class="forgot-password">
    <form
      v-if="isNewPassword"
      class="forgot-password__form"
      @submit.prevent="resetPassword()"
    >
      <div class="form__top">
        <h5 class="mb-m">{{ t("auth.forgotPassword.newPassword.title") }}</h5>

        <p>{{ t("auth.forgotPassword.newPassword.description") }}:</p>
        <p>{{ emailToResetPassword }}</p>
      </div>

      <div class="form__input-single form__with-icon">
        <label class="form__label">{{ t("forms.inputs.password") }}</label>
        <input
          v-model="password"
          type="password"
          name="password"
          id="password"
          minlength="8"
          required
          autocomplete="new-password"
          class="form__text-input"
        />
        <button
          v-if="!pressed"
          ref="revealPasswordButtonRef"
          class="btn-no-style input-single__icon input-single__clickable-icon"
        >
          <ri:eye-close-line />
        </button>
        <button
          v-else
          class="btn-no-style input-single__icon input-single__clickable-icon"
        >
          <ri:eye-line />
        </button>

        <!-- <ri:lock-password-line class="input-single__icon" /> -->
      </div>

      <!-- Submit button -->
      <button type="submit" class="btn btn-main" :disabled="loading">
        <span v-if="!loading"> {{ t("buttons.resetPassword") }}</span>
        <svg-spinners:90-ring-with-bg v-else />
      </button>
    </form>
    <form
      v-else
      class="forgot-password__form"
      @submit.prevent="sendResetPasswordRequest()"
    >
      <div class="form__top">
        <h5 class="mb-m">{{ t("auth.forgotPassword.title") }}</h5>

        <p>{{ t("auth.forgotPassword.enterEmail") }}</p>
      </div>

      <div class="form__input-single">
        <label class="form__label">{{ t("forms.inputs.email") }}</label>
        <input
          v-model="email"
          autofocus
          type="email"
          name="email"
          autocomplete="email"
          id="email"
          required
          class="form__text-input"
        />
      </div>
      <!-- Submit button -->
      <button v-if="!emailSent" type="submit" class="btn btn-main" :disabled="loading">
        <span v-if="!loading"> {{ t("buttons.sendResetLink") }}</span>
        <svg-spinners:90-ring-with-bg v-else />
      </button>

      <div v-else class="password-reset-success">
        <p class="password-reset-success__text">
          {{ t("auth.forgotPassword.newPassword.passwordResetSuccess") }}
        </p>

        <router-link :to="{ name: 'Login' }" class="auth__link">
          {{ t("auth.shared.signIn") }}
        </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.forgot-password {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100vh;

  .forgot-password__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-width: 20rem;
    width: 28rem;
    height: max-content;
    padding: 2rem;

    border: 1px solid var(--border);
    box-shadow: 0 0 20px 5px var(--shadow-darker);
    border-radius: $borderRadius;

    .form__top {
      text-align: center;
      margin-bottom: 2rem;
    }
  }
  .password-reset-success {
    text-align: center;

    .password-reset-success__text {
      font-weight: 600;
      color: var(--success);

      margin-bottom: 1rem;
    }
  }
}
</style>
