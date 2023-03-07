<script setup lang="ts">
import type { OnClickOutsideHandler } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'
import ConfettiExplosion from 'vue-confetti-explosion'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const emit = defineEmits(['closeModal'])

/****************************************
 * API CALLS
 ****************************************/
let spaceCreated = ref<boolean>(false)
let spaceName = ref<string>('')
let spacePassword = ref<string>('')
const handleCreateSpace = async () => {
  try {
    const { data, error } = await supabase.from('spaces').insert([
      {
        name: spaceName.value,
        user_id: authStore?.session?.user?.id,
        password: spacePassword.value ? spacePassword.value : null,
      },
    ])
    if (error) {
      throw error
    } else {
      spaceCreated.value = true
      showButtonLoading.value = false
      // emit('closeModal')
      // router.push({ name: 'Home' })
    }
  } catch (error: any) {
    console.log('CREATE SPACE CATCH ERROR: ', error.message)
  }
}

/****************************************
 * UI EVENTS
 ****************************************/

let showButtonLoading = ref<boolean>(false)
let buttonsActive = ref<boolean>(true)

const handleClickOnConfirm = async () => {
  buttonsActive.value = false
  showButtonLoading.value = true
  await handleCreateSpace()
}
const onClickCancel = async () => {
  buttonsActive.value = false
  emit('closeModal')
}

// Click outside
const clickOutsideHandlerModal: OnClickOutsideHandler = () => {
  emit('closeModal')
}

// Password protect
const passwordProtectEnabled = ref<boolean>(false)
const togglePasswordProtect = () => {
  passwordProtectEnabled.value = !passwordProtectEnabled.value
}

// Reveal password button
let revealPasswordButtonRef = ref<HTMLElement>()
const { pressed } = useMousePressed({ target: revealPasswordButtonRef })

// Show me
const onClickShowMe = () => {
  emit('closeModal')
  router.push({ name: 'Home' })
}
</script>
<template>
  <div class="create-space-modal">
    <div
      class="create-space-modal__content"
      v-on-click-outside.bubble="clickOutsideHandlerModal"
    >
      <form
        v-if="!spaceCreated"
        @submit.prevent="handleClickOnConfirm"
        class="content__form"
      >
        <h5 class="mb-xl">{{ t('space.createSpace.title') }}</h5>
        <div class="form__input-single">
          <label for="spaceName" class="form__label">{{
            t('space.createSpace.spaceName')
          }}</label>
          <!-- autocomplete="new-password" is to override autofill -->
          <!-- @input is for mobile(v-model won't update until input loses focus): https://github.com/vuejs/vue/issues/8231 -->
          <input
            v-model="spaceName"
            @input="(e) => (spaceName = e?.target?.value)"
            type="text"
            name="spaceName"
            id="spaceName"
            autocomplete="new-password"
            required
            :placeholder="t('space.createSpace.spaceNamePlaceholder')"
            class="form__text-input"
          />
        </div>

        <span class="toggle-container">
          <ri:lock-password-line class="mr-s" />
          <label class="toggle-container__text-left"
            >{{ t('space.createSpace.passwordProtect') }}
          </label>
          <input
            @input="togglePasswordProtect"
            class="toggle-switch toggle-switch-style"
            id="toggle1"
            type="checkbox"
          />
          <label class="toggle-switch-btn" for="toggle1"></label>
        </span>

        <div v-if="passwordProtectEnabled" class="form__input-single form__with-icon">
          <label for="spacePassword" class="form__label">{{
            t('space.createSpace.spacePassword')
          }}</label>

          <input
            v-model="spacePassword"
            :type="pressed ? 'text' : 'password'"
            autocomplete="new-password"
            name="spacePassword"
            id="spacePassword"
            minlength="8"
            required
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
        </div>

        <!-- Buttons -->
        <div class="form__bottom mt-xxl">
          <!-- Cancel -->
          <button
            @click.prevent="onClickCancel"
            :disabled="!buttonsActive"
            class="btn btn-outline mr-l"
          >
            {{ t('buttons.cancel') }}
          </button>

          <!-- Confirmation -->
          <button
            :disabled="
              !buttonsActive ||
              spaceName === '' ||
              (passwordProtectEnabled === true && spacePassword === '')
            "
            class="btn btn-save"
            type="submit"
          >
            <ph:check-circle v-if="!showButtonLoading" class="mr-s" />
            <div v-if="!showButtonLoading">{{ t('buttons.create') }}</div>
            <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
          </button>
        </div>
      </form>
      <!-- Space created -->
      <div v-else class="content__space-created">
        <ph:check-circle style="font-size: 3rem; color: var(--brand-green)" />
        <h5 class="mb-s" style="color: var(--brand-green)">{{
          t('space.createSpace.spaceCreated')
        }}</h5>

        <!-- Confetti -->
        <component
          :is="ConfettiExplosion"
          :particleCount="200"
          :particleSize="8"
          :duration="4000"
          :force="1"
          :colors="['#FF4755', '#98DB7C', '#000000']"
        />

        <button @click.prevent="onClickShowMe" class="btn btn-outline mt-l">
          {{ t('space.createSpace.showMe') }}
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.create-space-modal {
  backdrop-filter: blur(2px);
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: hsla(0, 0%, 0%, 0.295);
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: $modal-z-index;

  .create-space-modal__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: max-content;
    min-width: 25rem;
    max-width: 95vw; //mobile
    padding: 1.5rem 1rem;

    border-radius: $borderRadius;
    border: 1px solid var(--border);
    background-color: var(--bg-100);

    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.23);

    .content__form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;

      .form__bottom {
        display: flex;
        align-items: center;
        justify-content: start;
      }
    }
    .content__space-created {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      width: 100%;
    }
  }
}
</style>
