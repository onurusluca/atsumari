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
  <div class="login">
    <div class="login__top">
      <img
        src="@/assets/images/icons/icon-64.png"
        alt="Atsumari Icon 🍉"
        title="Atsumari Icon 🍉"
        class="top__icon"
      />
      <h4 class="top__title">{{ t('auth.login.topTitle') }}</h4>
      <p class="top__subtitle">
        {{ t('auth.login.subTitle') }}
      </p>
    </div>

    <!-- OAuth -->
    <div class="login__oauth">
      <button class="btn btn-outline oauth__signin-button">
        <logos:google-icon class="mr-s" />
        {{ t('auth.shared.signInWithGoogle') }}
      </button>
      <p>
        {{ t('auth.shared.or') }}
      </p>
    </div>

    <!-- Login form -->
    <form class="login__form" @submit.prevent="handleLogin">
      <div class="form__input-single">
        <p class="form__label">{{ t('forms.inputs.email') }}</p>
        <input
          v-model="email"
          type="text"
          name="email"
          id="email"
          required
          class="form__text-input"
        />
      </div>

      <div class="form__single-input">
        <p class="form__label">{{ t('forms.inputs.password') }}</p>
        <input
          v-model="password"
          type="password"
          name="password"
          id="password"
          required
          class="form__text-input"
        />
      </div>

      <div class="form__bottom">
        <div class="bottom__remember-me">
          <input type="checkbox" name="rememberMe" id="rememberMe" />
          <p for="rememberMe" class="ml-s">{{ t('forms.inputs.rememberMe') }}</p>
        </div>
        <router-link to="">
          {{ t('auth.shared.forgotPassword') }}
        </router-link>
      </div>

      <button
        v-if="!loading"
        type="submit"
        class="btn btn-main form__submit-btn"
        :disabled="loading"
      >
        <teenyicons:lock-solid class="submit-btn__lock-icon" />
        {{ t('buttons.signIn') }}
      </button>
      <button v-else class="btn btn-main form__submit-btn">
        <svg-spinners:90-ring-with-bg />
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.login {
  min-width: 20rem;
  width: 25rem;
  height: max-content;
  padding: 2rem;

  // border: 1px solid var(--border-color);
  // box-shadow: 0 0 0.5rem var(--shadow-color);
  .login__top {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 1.5rem;
    .top__icon {
      margin-bottom: 1rem;
    }
    .top__title {
      color: var(--main-color);
    }
  }
  .login__oauth {
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
  .login__form {
    .form__bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      margin: 1rem 0 2rem 0;
      .bottom__remember-me {
        display: flex;
        align-items: center;
      }
    }

    .form__submit-btn {
      width: 100%;
      position: relative;
      .submit-btn__lock-icon {
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translate(0%, -50%);
        color: rgba(255, 255, 255, 0.582);
      }
    }
  }
}
</style>
