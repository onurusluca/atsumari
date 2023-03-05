<script setup lang="ts">
const { t } = useI18n()

let deleteConfirmationTextInput = ref<string>('')

const props = defineProps<{
  modalType: String
  modalItem?: String
  itemType?: String
}>()

const emit = defineEmits([
  'closeModal',
  'modalCreateConfirmation',
  'modalSaveConfirmation',
  'modalDeleteConfirmation',
])

let showButtonLoading = ref<boolean>(false)
let buttonsActive = ref<boolean>(true)

function handleClickOnConfirm() {
  buttonsActive.value = false
  showButtonLoading.value = true

  props.modalType === 'createConfirmation'
    ? emit('modalCreateConfirmation')
    : props.modalType === 'saveConfirmation'
    ? emit('modalSaveConfirmation')
    : props.modalType === 'deleteConfirmation'
    ? emit('modalDeleteConfirmation')
    : ''
}

function onClickCancel() {
  buttonsActive.value = false
  emit('closeModal')
}
</script>
<template>
  <div class="confirmation-modal">
    <div class="confirmation-modal-content">
      <carbon-warning-square
        v-if="
          modalType === 'deleteConfirmation' ||
          modalType === 'clearJsonKeyConfirmation' ||
          modalType === 'deleteRecentlyUsedHistoryConfirmation'
        "
        class="top-alert-icon"
        style="font-size: 3rem; color: red"
      />
      <carbon-warning-square
        v-if="
          modalType !== 'deleteConfirmation' &&
          modalType !== 'clearJsonKeyConfirmation' &&
          modalType !== 'deleteRecentlyUsedHistoryConfirmation'
        "
        class="top-alert-icon"
        style="font-size: 3rem; color: #ffd934"
      />
      <h3 class="top-delete-confirmation">
        {{
          modalType === 'createConfirmation'
            ? t('modals.askCreateConfirm')
            : modalType === 'saveConfirmation'
            ? t('modals.askSaveConfirm')
            : modalType === 'deleteConfirmation'
            ? t('modals.askDeleteConfirm')
            : ''
        }}
      </h3>

      <!-- Item to be processed -->
      <p class="top-modal-item mb-s mt-3">{{ modalItem }}</p>

      <!-- Input to confirm deletion by completing a simple text confirmation -->
      <div
        v-if="modalType === 'deleteConfirmation'"
        class="form-input-single delete-confirmation-text-input mt-3"
      >
        <label for="name" class="mb-2">
          {{ t('forms.writeTheAboveTextToConfirmDeletion') }}
        </label>
        <input
          class="form-input"
          v-model="deleteConfirmationTextInput"
          :disabled="!buttonsActive"
          type="text"
          name="name"
          maxlength="50"
          required
        />
      </div>

      <!-- Buttons -->
      <div class="modal-content-bottom mt-4">
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
          v-show="modalType !== 'deleteConfirmation'"
          :disabled="!buttonsActive"
          class="btn btn-save"
        >
          <div v-if="!showButtonLoading">OK</div>
          <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
        </button>

        <!-- Delete Confirmation -->
        <button
          @click="handleClickOnConfirm"
          v-show="modalType === 'deleteConfirmation'"
          :disabled="!buttonsActive || deleteConfirmationTextInput !== modalItem"
          class="btn btn-danger"
        >
          <div v-if="!showButtonLoading">OK</div>
          <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.confirmation-modal {
  backdrop-filter: blur(2px);
  position: fixed;
  z-index: 9998;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: hsla(0, 0%, 0%, 0.219);
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  .confirmation-modal-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: max-content;
    min-width: 30rem;
    padding: 1.5rem 1rem;
    margin-right: 1rem;

    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    background-color: var(--overlay-menu-bg-color);
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

    .top-modal-item {
      font-weight: bold;
      color: $in-menu-title;

      margin-bottom: 0;
    }
    .top-delete-confirmation {
      margin-bottom: 0;
    }

    .modal-content-bottom {
      display: flex;
      align-items: center;
      justify-content: start;
    }

    .delete-confirmation-text-input {
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
    }
  }
}
</style>
