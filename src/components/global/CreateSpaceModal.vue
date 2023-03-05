<script setup lang="ts">
import type { OnClickOutsideHandler } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'

const { t } = useI18n()

const emit = defineEmits(['closeModal'])

/****************************************
 * API CALLS
 ****************************************/

const handleCreateSpace = async () => {
  try {
    const { data, error } = await supabase.from('spaces').insert([
      {
        name: 'My Space',
        user_id: authStore?.session?.user?.id,
      },
    ])
    if (error) throw error
    console.log('Space created!: ', data)
  } catch (error: any) {
    console.log('CREATE SPACE CATCH ERROR: ', error.message)
  }
}

/****************************************
 * UI EVENTS
 ****************************************/

let showButtonLoading = ref<boolean>(false)
let buttonsActive = ref<boolean>(true)

function handleClickOnConfirm() {
  buttonsActive.value = false
  showButtonLoading.value = true
}

function onClickCancel() {
  buttonsActive.value = false
  emit('closeModal')
}

// Click outside
const clickOutsideHandlerModal: OnClickOutsideHandler = (event) => {
  console.log('OUTSIDE')
  emit('closeModal')
}
</script>
<template>
  <div class="create-space-modal">
    <div
      class="create-space-modal__content"
      v-on-click-outside.bubble="clickOutsideHandlerModal"
    >
      <!-- Buttons -->
      <div class="content__bottom mt-xxl">
        <!-- Cancel -->
        <button
          @click="onClickCancel"
          :disabled="!buttonsActive"
          class="btn btn-outline mr-l"
        >
          {{ t('buttons.cancel') }}
        </button>

        <!-- Confirmation -->
        <button
          @click="handleClickOnConfirm"
          :disabled="!buttonsActive"
          class="btn btn-save"
        >
          <div v-if="!showButtonLoading">OK</div>
          <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.create-space-modal {
  backdrop-filter: blur(2px);
  position: fixed;
  z-index: $modal-z-index;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: hsla(0, 0%, 0%, 0.295);
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  .create-space-modal__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: max-content;
    min-width: 25rem;
    max-width: 95vw; //mobile
    padding: 1.5rem 1rem;

    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background-color: var(--bg-100);

    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.23);

    .content__bottom {
      display: flex;
      align-items: center;
      justify-content: start;
    }
  }
}
</style>
