<script setup lang="ts">
const { t } = useI18n();

let deleteSpaceConfirmationTextInput = ref<string>("");

const props = defineProps<{
  modalType: String;
  modalItem?: String;
}>();

const emit = defineEmits([
  "closeConfirmationModal",
  "modalCreateConfirmation",
  "modalSaveConfirmation",
  "modalDeleteSpaceConfirmation",
]);

let showButtonLoading = ref<boolean>(false);
let buttonsActive = ref<boolean>(true);

function handleClickOnConfirm() {
  buttonsActive.value = false;
  showButtonLoading.value = true;

  props.modalType === "createConfirmation"
    ? emit("modalCreateConfirmation")
    : props.modalType === "saveConfirmation"
    ? emit("modalSaveConfirmation")
    : props.modalType === "deleteSpaceConfirmation"
    ? emit("modalDeleteSpaceConfirmation")
    : "";
}

function onClickCancel() {
  buttonsActive.value = false;
  emit("closeConfirmationModal");
}
</script>
<template>
  <div
    class="confirmation-modal"
    :style="{
      backgroundColor:
        modalType === 'deleteSpaceConfirmation' ? '#ff000046' : 'var(--modal-overlay)',
    }"
  >
    <div class="confirmation-modal__content">
      <div class="content__top"
        ><fluent-emoji-flat:warning
          v-if="modalType === 'deleteSpaceConfirmation'"
          class="top__icon"
          style="font-size: 3rem; color: red"
        />
        <ph:warning-circle
          v-if="modalType !== 'deleteSpaceConfirmation'"
          class="top__icon"
          style="font-size: 3rem; color: #ffd934"
        />
        <h5 class="top__delete-confirmation">
          {{
            modalType === "createConfirmation"
              ? t("modals.askCreateConfirm")
              : modalType === "saveConfirmation"
              ? t("modals.askSaveConfirm")
              : modalType === "deleteSpaceConfirmation"
              ? t("modals.askDeleteConfirm")
              : ""
          }}
        </h5>
        <p v-if="modalType === 'deleteSpaceConfirmation'">
          {{ t("modals.deleteConfirmDescription") }}</p
        >
      </div>

      <div class="content__body">
        <!-- Item to be processed -->
        <p class="body__modal-item">{{ modalItem }}</p>

        <!-- Input to confirm deletion by completing a simple text confirmation -->
        <div v-if="modalType === 'deleteSpaceConfirmation'" class="form__input-single">
          <label for="name" class="form__label">
            {{ t("modals.writeTheAboveTextToConfirmDeletion") }}
          </label>
          <input
            class="form__text-input"
            v-model="deleteSpaceConfirmationTextInput"
            :disabled="!buttonsActive"
            type="text"
            name="name"
            maxlength="50"
            required
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="content__bottom">
        <!-- Cancel -->
        <button
          @click="onClickCancel"
          :disabled="!buttonsActive"
          class="btn btn-outline mr-l"
        >
          {{ t("buttons.cancel") }}
        </button>

        <!-- Confirmation -->
        <button
          @click="handleClickOnConfirm"
          v-show="modalType === 'confirm'"
          :disabled="!buttonsActive"
          class="btn btn-save"
        >
          <div v-if="!showButtonLoading">OK</div>
          <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
        </button>

        <!-- Delete Confirmation -->
        <button
          @click="handleClickOnConfirm"
          v-show="modalType === 'deleteSpaceConfirmation'"
          :disabled="!buttonsActive || deleteSpaceConfirmationTextInput !== modalItem"
          class="btn btn-danger"
        >
          <div v-if="!showButtonLoading">{{ t("buttons.deleteSpace") }}</div>
          <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.confirmation-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  // Glassmorphism
  backdrop-filter: blur(4px);

  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  z-index: $modal-z-index;
  .confirmation-modal__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;

    position: relative;
    min-width: 30rem;
    max-width: 95vw;
    padding: 2rem;

    border-radius: $borderRadius;
    border: 1px solid var(--border);
    background-color: var(--bg-100);

    box-shadow: 0px 3px 10px 2px var(--shadow);

    .content__top {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      max-width: 30rem;

      .top__icon {
        margin-bottom: 1rem;
      }

      .top__delete-confirmation {
        margin-bottom: 0.5rem;
      }
    }

    .content__body {
      margin: 1.5rem 0;
      .body__modal-item {
        font-weight: 600;
        font-size: 1.3rem;
        color: var(--subject-font);
        margin-bottom: 1rem;
      }
    }

    .content__bottom {
      display: flex;
      align-items: center;
      justify-content: start;
    }
  }
}
</style>
