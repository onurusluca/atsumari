<script setup lang="ts">
import { supabase } from '@/utils/supabaseInit'
import { useAuthStore } from '@/stores/authStore'
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

defineProps({
  authType: String,
})

const emit = defineEmits(['change', 'delete'])

let email = ref<string>('')
let password = ref<any>(null)
let loading = ref(false)
let rememberMeChecked = ref(false)
let errorUi = ref<string>('')
let showEmailVerification = ref<boolean>(false)

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) {
      errorUi.value = 'auth.register.checkEmail'
    } else {
      router.push({ name: 'Home' })
    }
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  try {
    loading.value = true

    let { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (data) {
      showEmailVerification.value = true
    }
    if (error) throw error
    errorUi.value = 'auth.register.checkEmail'
    return
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
  <div class="auth">
    <div class="auth__top">
      <img
        src="@/assets/images/icons/icon-64.png"
        alt="Atsumari Icon 🍉"
        title="Atsumari Icon 🍉"
        class="top__icon"
      />
      <h4 class="top__title">{{
        authType === 'login' ? t('auth.login.topTitle') : t('auth.register.topTitle')
      }}</h4>
      <p class="top__subtitle">
        {{
          authType === 'login' ? t('auth.login.subTitle') : t('auth.register.subTitle')
        }}
      </p>
    </div>

    <!-- OAuth -->
    <div class="auth__oauth">
      <button class="btn btn-outline oauth__signin-button">
        <logos:google-icon class="mr-s" />
        {{ t('auth.shared.signInWithGoogle') }}
      </button>
      <p>
        {{ t('auth.shared.or') }}
      </p>
    </div>

    <!-- auth form -->
    <form
      class="auth__form"
      @submit.prevent="authType === 'login' ? handleLogin() : handleRegister()"
    >
      <div class="form__input-single form__with-icon">
        <p class="form__label">{{ t('forms.inputs.email') }}</p>
        <input
          v-model="email"
          type="text"
          name="email"
          id="email"
          required
          class="form__text-input"
        />
        <ri:mail-line class="input-single__icon" />
      </div>

      <div class="form__input-single form__with-icon">
        <p class="form__label">{{ t('forms.inputs.password') }}</p>
        <input
          v-model="password"
          type="password"
          name="password"
          id="password"
          required
          class="form__text-input"
        />
        <ri:lock-password-line class="input-single__icon" />
      </div>

      <!-- Remember me, Forgot password -->
      <div v-if="authType === 'login'" class="form__bottom">
        <div class="bottom__remember-me">
          <input
            v-model="rememberMeChecked"
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
          />

          <p for="rememberMe" class="ml-s">{{ t('forms.inputs.rememberMe') }}</p>
        </div>
        <router-link to="" class="mb-s">
          {{ t('auth.shared.forgotPassword') }}
        </router-link>
      </div>

      <p>{{ t(errorUi) }}</p>

      <!-- Submit button -->
      <button type="submit" class="btn form__submit-btn" :disabled="loading">
        <span v-if="!loading">
          <!--  <teenyicons:lock-solid class="submit-btn__lock-icon" /> -->

          {{
            authType === 'login' ? t('buttons.signIn') : t('buttons.createAccount')
          }}</span
        >
        <svg-spinners:90-ring-with-bg v-else />
      </button>
    </form>

    <div class="auth__bottom">
      <router-link :to="{ name: `${authType === 'login' ? 'Register' : 'Login'}` }">
        {{
          authType === 'login'
            ? t('auth.shared.dontHaveAccount')
            : t('auth.shared.alreadyHaveAccount')
        }}
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth {
  min-width: 20rem;
  width: 28rem;
  height: max-content;
  padding: 2rem;

  border: 1px solid var(--border);
  box-shadow: 0 0 0.5rem var(--shadow);
  .auth__top {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 1.5rem;
    .top__icon {
      margin-bottom: 1rem;
    }
    .top__title {
      color: var(--primary-100);
    }
  }
  .auth__oauth {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    .oauth__signin-button {
      width: 100%;
      margin: 0.5rem 0 1.5rem 0;
    }
  }
  .auth__form {
    .form__bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      margin: 1rem 0 0 0;
      .bottom__remember-me {
        display: flex;
      }
    }

    .form__submit-btn {
      width: 100%;
      position: relative;

      margin-top: 3rem;

      color: #fff;
      background-color: #00ebc7;
      border: none;

      &:hover {
        background-color: #00d6b6;
      }
      .submit-btn__lock-icon {
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translate(0%, -50%);
        color: rgba(255, 255, 255, 0.582);
      }
    }
  }
  .auth__bottom {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;

    a {
      text-decoration: underline;
    }
  }
}
</style>
