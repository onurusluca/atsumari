<script setup lang="ts">
import type { OnClickOutsideHandler } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import ConfettiExplosion from "vue-confetti-explosion";

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const emit = defineEmits(["closeModal"]);

/****************************************
 * API CALLS
 ****************************************/
let spaceCreated = ref<boolean>(false);
let spaceName = ref<string>("");
let spacePassword = ref<string>("");
const handleCreateSpace = async () => {
  try {
    const { error } = await supabase.from("spaces").insert([
      {
        name: spaceName.value,
        user_id: authStore?.session?.user?.id,
        password: spacePassword.value ? spacePassword.value : null,
      },
    ]);
    if (error) {
      throw error;
    } else {
      spaceCreated.value = true;
      showButtonLoading.value = false;
      // emit('closeModal')
      // router.push({ name: 'Home' })
    }
  } catch (error: any) {
    console.log("CREATE SPACE CATCH ERROR: ", error.message);
  }
};

/****************************************
 * UI
 ****************************************/
// Step logic

let showButtonLoading = ref<boolean>(false);
let buttonsActive = ref<boolean>(true);

const handleClickOnConfirm = async () => {
  buttonsActive.value = false;
  showButtonLoading.value = true;
  await handleCreateSpace();
};
const onClickCancel = async () => {
  buttonsActive.value = false;
  emit("closeModal");
};

// Click outside
const clickOutsideHandlerModal: OnClickOutsideHandler = () => {
  emit("closeModal");
};

// Password protect
const passwordProtectEnabled = ref<boolean>(false);
const togglePasswordProtect = () => {
  passwordProtectEnabled.value = !passwordProtectEnabled.value;
};

// Reveal password button
let revealPasswordButtonRef = ref<HTMLElement>();
const { pressed } = useMousePressed({ target: revealPasswordButtonRef });

// Show me
const onClickShowMe = () => {
  emit("closeModal");
  router.push({ name: "Home" });
};

const spaceNamePatternNotMatched = computed(() => {
  if (spaceName.value !== "") {
    return !spaceName.value.match(/^[a-zA-Z0-9 _,-]+$/) ? true : false;
  }
});

const passwordLengthIsTooShort = computed(() => {
  if (spacePassword.value !== "") {
    return spacePassword.value.length < 4 ? true : false;
  }
});

// Tabs logic
let activeStep = ref<number>(0);
let animationType = ref<string>("");
const onClickBack = (step: number) => {
  animationType.value = "slide-right-fade";
  activeStep.value = step;
};
const onClickNext = (step: number) => {
  animationType.value = "slide-left-fade";

  activeStep.value = step;
};
</script>
<template>
  <div class="create-space-modal">
    <div
      class="create-space-modal__content"
      v-on-click-outside.bubble="clickOutsideHandlerModal"
    >
      <div class="steps">
        <!-- Steps -->
        <Transition :name="animationType" mode="out-in">
          <!-- Step 1 -->
          <section v-if="activeStep === 0" class="steps__step">
            <form v-if="!spaceCreated" class="content__form">
              <h5 class="mb-xl">{{ t("spaces.createSpace.title") }}</h5>
              <div class="form__input-single">
                <label for="spaceName" class="form__label"
                  >{{ t("spaces.createSpace.spaceName") }}
                  <span style="font-size: 0.9rem; color: var(--paler-font)"
                    >({{ t("spaces.createSpace.thisWillAppearInURL") }})</span
                  ></label
                >
                <!-- @input is for mobile(v-model won't update until input loses focus): https://github.com/vuejs/vue/issues/8231 -->
                <input
                  v-model="spaceName"
                  @input="(e) => (spaceName = e?.target?.value)"
                  type="text"
                  name="spaceName"
                  id="spaceName"
                  required
                  pattern="^[a-zA-Z0-9 _,-]+$"
                  maxlength="30"
                  :placeholder="t('spaces.createSpace.spaceNamePlaceholder')"
                  class="form__text-input"
                  @keypress.enter.native.prevent
                />
                <p
                  v-if="spaceNamePatternNotMatched"
                  class="warning-text mt-m"
                  style="font-size: 0.9rem"
                >
                  {{ t("spaces.createSpace.matchThePattern") }}
                </p>
              </div>

              <span class="toggle-container">
                <ri:lock-password-line class="mr-s" />
                <label class="toggle-container__text-left"
                  >{{ t("spaces.createSpace.passwordProtect") }}
                </label>
                <input
                  @input="togglePasswordProtect"
                  class="toggle-switch toggle-switch-style"
                  id="toggle1"
                  type="checkbox"
                />
                <label class="toggle-switch-btn" for="toggle1"></label>
              </span>

              <div
                v-if="passwordProtectEnabled"
                class="form__input-single form__with-icon"
              >
                <label for="spacePassword" class="form__label">{{
                  t("spaces.createSpace.spacePassword")
                }}</label>

                <input
                  v-model="spacePassword"
                  :type="pressed ? 'text' : 'password'"
                  autocomplete="new-password"
                  name="spacePassword"
                  id="spacePassword"
                  minlength="4"
                  required
                  class="form__text-input"
                  @keypress.enter.native.prevent
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

                <!-- Password length warning -->
                <p
                  v-show="passwordLengthIsTooShort"
                  class="warning-text mt-m"
                  style="font-size: 0.9rem"
                >
                  {{ t("spaces.createSpace.passwordLengthWarning") }}
                </p>
              </div>

              <!-- Buttons -->
              <div class="form__bottom mt-xxl">
                <!-- Cancel -->
                <button @click.prevent="onClickCancel" class="btn btn-outline mr-l">
                  {{ t("buttons.cancel") }}
                </button>

                <!-- Confirmation -->
                <button
                  :disabled="
                    !buttonsActive ||
                    passwordLengthIsTooShort ||
                    spaceNamePatternNotMatched ||
                    spaceName === '' ||
                    (passwordProtectEnabled === true && spacePassword === '')
                  "
                  @click.prevent="onClickNext(1)"
                  class="btn btn-create"
                >
                  <div v-if="!showButtonLoading">{{ t("buttons.next") }}</div>
                  <carbon:chevron-right v-if="!showButtonLoading" class="ml-s" />
                </button>
              </div>
            </form>
          </section>

          <!-- Step 2 -->
          <section v-else-if="activeStep === 1" class="steps__step">
            <p>fsdfsd</p>
            <br /><p>fsdfsd</p> <br /><p>fsdfsd</p> <br /><p>fsdfsd</p> <br /><p
              >fsdfsd</p
            >
            <br /><p>fsdfsd</p> <br /><p>fsdfsd</p> <br /><p>fsdfsd</p> <br /><p
              >fsdfsd</p
            >
            <!-- Buttons -->
            <div class="form__bottom mt-xxl">
              <!-- Cancel -->
              <button @click.prevent="onClickBack(0)" class="btn btn-outline mr-l">
                <carbon:chevron-left class="mr-s" />

                {{ t("buttons.back") }}
              </button>

              <!-- Confirmation -->
              <button @click.prevent="onClickNext(2)" class="btn btn-create">
                <div v-if="!showButtonLoading">{{ t("buttons.next") }}</div>
                <carbon:chevron-right v-if="!showButtonLoading" class="ml-s" />
              </button>
            </div>
          </section>
        </Transition>
      </div>
      <!-- Space created -->
      <div v-if="activeStep === 4" class="content__space-created">
        <ph:check-circle style="font-size: 3rem; color: var(--brand-green)" />
        <h5 class="mb-s" style="color: var(--brand-green)">{{
          t("spaces.createSpace.spaceCreated")
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
          {{ t("spaces.createSpace.showMe") }}
        </button>
      </div>
    </div>
  </div>

  <!--   <svg-spinners:90-ring-with-bg v-show="showButtonLoading" /> -->
</template>
<style scoped lang="scss">
.create-space-modal {
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
  background: var(--modal-overlay);
  overflow: hidden;

  z-index: $modal-z-index;

  .create-space-modal__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    min-width: 35rem;
    max-width: 90vw; //mobile
    padding: 1.5rem 1rem;

    border-radius: $borderRadius;
    border: 1px solid var(--border);
    background-color: var(--bg-100);

    box-shadow: 0px 3px 10px 2px var(--shadow);

    .content__form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .form__bottom {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .content__space-created {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
