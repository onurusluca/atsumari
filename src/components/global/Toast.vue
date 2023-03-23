<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  toastType: String;
  toastTheme?: String;
  toastItem?: String;
}>();
</script>

<template>
  <div v-if="toastType" class="toast">
    <div class="toast__content">
      <p class="toast__content__text">
        {{
          toastType === "savedNotification"
            ? t("toasts.saved")
            : toastType === "createdNotification"
            ? t("toasts.created")
            : toastType === "deletedNotification"
            ? t("toasts.deleted")
            : toastType === "copiedNotification"
            ? t("toasts.copied")
            : ""
        }}
      </p>

      <!-- Item name -->
      <p class="toast__content__title">
        {{ toastItem }}
      </p>
    </div>

    <!-- Icons -->
    <div class="toast__right">
      <carbon-checkmark-outline
        v-if="toastTheme === 'successToast'"
        class="toast-icon"
        style="font-size: 2rem; color: white"
      />
      <ph-x-square-duotone
        v-if="toastTheme === 'warningToast'"
        class="toast-icon"
        style="font-size: 2rem; color: yellow"
      />
      <carbon-warning-alt
        v-if="toastTheme === 'dangerToast'"
        class="toast-icon"
        style="font-size: 2rem; color: red"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.toast {
  position: fixed;
  bottom: 3rem;
  right: 2rem;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-align: start;

  width: 22rem;
  height: max-content;
  padding: 1rem 2rem;

  font-weight: 600;
  background: var(--bg-100);
  border-radius: 0.5rem;
  box-shadow: 0px 10px 15px -3px var(--shadow);
  border: 1px solid var(--border);
  z-index: $toast-z-index;

  .toast__right {
    position: absolute;
    right: 0;
    bottom: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    height: 100%;
    width: 3rem;

    background-color: var(--toast-success);
    border-radius: 0 0.5rem 0.5rem 0;
  }

  .toast__content {
    padding: 0.5rem;
    line-break: anywhere;

    .toast__content__title {
      font-size: 0.9rem;
      font-weight: bold;
      color: var(--darker-green);
      word-wrap: break-word;
    }
    .toast__content__text {
      word-break: normal;
    }
  }
}
</style>
