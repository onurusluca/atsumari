<script setup lang="ts">
import type { OnClickOutsideHandler } from "@vueuse/core";
import type { SpacesType } from "@/api/types";

import { vOnClickOutside } from "@vueuse/components";
import ConfettiExplosion from "vue-confetti-explosion";
import { getCurrentUrlOrigin } from "@/utils/general";

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

let spaceSize = ref<number>(2);
const handleCreateSpace = async () => {
  try {
    const { error } = await supabase.from("spaces").insert([
      {
        name: spaceName.value,
        user_id: authStore?.session?.user?.id,
        password: spacePassword.value ? spacePassword.value : null,
        image: spaceMap.value,
        size: spaceSize.value,
      },
    ]);
    if (error) {
      throw error;
    } else {
      await handleReadSpace();
      spaceCreated.value = true;
      showButtonLoading.value = false;

      activeStep.value = 2;
    }
  } catch (error: any) {
    console.log("CREATE SPACE CATCH ERROR: ", error.message);
  }
};

let userSpaces = ref<SpacesType[]>([]);
const handleReadSpace = async () => {
  // Get the created space
  try {
    let { data: spaces, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("user_id", authStore?.session?.user?.id)
      .eq("name", spaceName.value);
    if (spaces) {
      userSpaces.value = spaces;
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ SPACE CATCH ERROR: ", error.message);
  }
};

/****************************************
 * UI
 ****************************************/
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
let totalSteps = ref<number>(3);
let animationType = ref<string>("");
const onClickBack = (step: number) => {
  animationType.value = "slide-right-fade";
  activeStep.value = step;
};
const onClickNext = (step: number) => {
  animationType.value = "slide-left-fade";

  activeStep.value = step;
};

// Theme selection
const spaceMapImages = reactive<Record<string, string>>({
  nature:
    "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/newworld.png",
  modern:
    "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/modern.png",
  city: "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/city.png",
  fantasy:
    "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/fantasy.png",
});

let currentTheme = ref<string>("Nature");
let spaceMap = ref<string>(spaceMapImages.nature);

const handleSelectMap = (map: string) => {
  currentTheme.value = map;
  spaceMap.value = spaceMapImages[currentTheme.value.toLowerCase()];
};

// Range slider
const sliderSettings = reactive({
  min: 1,
  max: 100,
  step: 1,
  stepValues: [2, 25, 50, 100],
  ranges: {
    2: "2-5",
    10: "6-20",
    25: "21-50",
    50: "51-100",
    100: "100+",
  } as Record<number, string>,
});
const stepIndex = ref<number>(0);
const handleChange = (event: Event) => {
  // Change stepIndex based on slider steps: 0 is 2, 1 is 25, 2 is 50, 3 is 100
  stepIndex.value = +(event.target as HTMLInputElement).value;
  spaceSize.value = sliderSettings.stepValues[stepIndex.value];
};

const hostableUsersCountRange = computed(() => {
  return sliderSettings.ranges[spaceSize.value];
});

// Copy
const onCopyToClipboard = (spaceUrl: string) => {
  navigator.clipboard.writeText(spaceUrl);
  showToast("copiedNotification");
};

// Make space name URL friendly
const slugify = (string: string) => {
  return string
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-");
};

// Toast
let toastOpen = ref<boolean>(false);
let toastType = ref<string>("");

function showToast(toastTypeProp: string) {
  // Set toast props
  toastType.value = toastTypeProp;
  toastOpen.value = true;

  setTimeout(() => {
    toastOpen.value = false;
  }, 5500);
}

// Go to space
const handleClickGoToSpace = (spaceId: string, spaceName: string) => {
  // emit("closeModal");
  router.push({ name: "Space", params: { id: spaceId, name: spaceName } });
};
</script>
<template>
  <div class="create-space-modal">
    <div
      class="create-space-modal__content"
      v-on-click-outside.bubble="clickOutsideHandlerModal"
    >
      <button class="btn btn-icon content__close-modal-btn" @click="onClickCancel">
        <ph:x-bold />
      </button>

      <!--    <h5 class="mb-xxl">
        {{ t("spaces.createSpace.title") }}
      </h5> -->

      <!-- Steps -->
      <Transition :name="animationType" mode="out-in">
        <keep-alive>
          <div :key="activeStep">
            <!-- STEP 1 -->
            <section v-if="activeStep === 0" class="content__step">
              <h6 class="step__title">{{
                t("spaces.createSpace.steps.step1.title")
              }}</h6>
              <!--    <p class="step__description">{{
            t("spaces.createSpace.steps.step1.description")
          }}</p> -->

              <form v-if="!spaceCreated" class="step-one__form">
                <div class="form__input-single">
                  <label for="spaceName" class="form__label"
                    >{{ t("spaces.createSpace.spaceName") }}
                  </label>
                  <!-- @input is for mobile(v-model won't update until input loses focus): https://github.com/vuejs/vue/issues/8231 -->
                  <input
                    v-model="spaceName"
                    @input="(e: Event ) => (spaceName = (e.target as HTMLInputElement
                    )?.value)"
                    type="text"
                    name="spaceName"
                    id="spaceName"
                    required
                    pattern="^[a-zA-Z0-9 _,-]+$"
                    maxlength="30"
                    :placeholder="t('spaces.createSpace.thisWillAppearInURL')"
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
                    class="btn btn-no-style input-single__icon input-single__clickable-icon"
                  >
                    <ri:eye-close-line />
                  </button>
                  <button
                    v-else
                    class="btn btn-no-style input-single__icon input-single__clickable-icon"
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
                <div class="step_bottom-controls mt-xxl">
                  <!-- Cancel -->
                  <button @click.prevent="onClickCancel" class="btn btn-outline mr-l">
                    {{ t("buttons.cancel") }}
                  </button>

                  <p class="bottom-controls__current-step"
                    >{{ activeStep + 1 }}/{{ totalSteps }}</p
                  >

                  <!-- Next -->
                  <button
                    :disabled="
                      passwordLengthIsTooShort ||
                      spaceNamePatternNotMatched ||
                      spaceName === '' ||
                      (passwordProtectEnabled === true && spacePassword === '')
                    "
                    @click.prevent="onClickNext(1)"
                    class="btn btn-create"
                  >
                    <div>{{ t("buttons.next") }}</div>
                    <carbon:chevron-right class="ml-s" />
                  </button>
                </div>
              </form>
            </section>

            <!-- STEP 2 -->
            <section v-else-if="activeStep === 1" class="content__step">
              <h6 class="step__title">{{
                t("spaces.createSpace.steps.step2.title")
              }}</h6>
              <form class="step-two__form">
                <div class="form__left">
                  <img
                    :src="spaceMap"
                    :alt="t('alts.spaceImage')"
                    class="left__image"
                  />
                </div>
                <div class="form__right">
                  <div class="right__top">
                    <!-- Map theme(type) -->
                    <p class="right__title">
                      {{ t("spaces.createSpace.steps.step2.mapTheme.title") }}
                    </p>
                    <div class="top__buttons">
                      <button
                        @click.prevent="handleSelectMap('Nature')"
                        class="btn btn-outline"
                        :class="currentTheme === 'Nature' ? 'btn-outline--active' : ''"
                      >
                        <emojione:deciduous-tree class="mr-s" />
                        {{ t("spaces.createSpace.steps.step2.mapTheme.nature") }}
                      </button>

                      <button
                        @click.prevent="handleSelectMap('Modern')"
                        class="btn btn-outline"
                        :class="currentTheme === 'Modern' ? 'btn-outline--active' : ''"
                      >
                        <emojione:office-building class="mr-s" />
                        {{ t("spaces.createSpace.steps.step2.mapTheme.modern") }}
                      </button>
                    </div>
                  </div>
                  <div class="right__bottom">
                    <div class="form__input-single">
                      <div class="bottom__title">
                        <label for="spaceName" class="right__title"
                          >{{ t("spaces.createSpace.steps.step2.spaceSize") }}
                        </label>
                        <p class="flex-center">
                          <ph:users-fill style="font-size: 1.1rem" class="mr-xs" />{{
                            hostableUsersCountRange
                          }}</p
                        >
                      </div>

                      <!-- Range slider -->
                      <div class="right__space-size-selector">
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="1"
                          :value="stepIndex"
                          @input="handleChange"
                          class="space-size-selector__slider"
                        />
                        <div class="space-size-selector__step-labels">
                          <div
                            v-for="(step, index) in sliderSettings.stepValues"
                            :key="index"
                            class="step-labels__label"
                          >
                            {{ step }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <!-- Buttons -->
              <div class="step_bottom-controls mt-xxl">
                <!-- Cancel -->
                <button @click.prevent="onClickBack(0)" class="btn btn-outline mr-l">
                  <carbon:chevron-left class="mr-s" />

                  {{ t("buttons.back") }}
                </button>

                <p class="bottom-controls__current-step"
                  >{{ activeStep + 1 }}/{{ totalSteps }}</p
                >
                <!-- Next -->
                <button
                  @click.prevent="handleClickOnConfirm"
                  :disabled="!buttonsActive"
                  class="btn btn-create"
                >
                  <div v-if="!showButtonLoading">{{ t("buttons.createSpace") }}</div>
                  <ph:check-circle v-if="!showButtonLoading" class="ml-s" />
                  <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
                </button>
              </div>
            </section>

            <!-- STEP 3 (complete) -->
            <section v-else-if="activeStep === 2" class="content__step">
              <!-- Space created -->
              <div class="content__space-created">
                <ph:check-circle style="font-size: 3rem; color: var(--brand-green)" />
                <h5 class="mb-s" style="color: var(--brand-green)">{{
                  t("spaces.createSpace.spaceCreated")
                }}</h5>
              </div>

              <h6 class="step__title-centered mt-xl mb-xxl">{{ spaceName }}</h6>

              <!-- Space URL and copy -->
              <div class="content__space-url">
                <div class="space-url__input">
                  <input
                    type="text"
                    :value="`${getCurrentUrlOrigin()}/space/${
                      userSpaces[0].id
                    }/${slugify(userSpaces[0].name)}`"
                    class="form__text-input"
                    readonly
                  />
                  <button
                    @click="
                      onCopyToClipboard(
                        `${getCurrentUrlOrigin()}/space/${userSpaces[0].id}/${slugify(
                          userSpaces[0].name
                        )}`
                      )
                    "
                    class="btn btn-icon"
                  >
                    <carbon:copy
                      style="
                        font-size: 1rem;
                        color: var(--text-100);
                        margin-right: 0.5rem;
                      "
                    />
                    {{ t("spaces.copySpaceUrl") }}
                  </button>
                </div>
              </div>

              <!-- Buttons -->
              <div class="step_bottom-controls mt-xxl">
                <button @click.prevent="onClickShowMe" class="btn btn-outline">
                  {{ t("spaces.createSpace.showMe") }}
                </button>

                <!-- Next -->
                <button
                  @click.prevent="
                    handleClickGoToSpace(slugify(userSpaces[0].id), userSpaces[0].name)
                  "
                  class="btn btn-create"
                >
                  <!-- Confetti -->
                  <component
                    :is="ConfettiExplosion"
                    :particleCount="200"
                    :particleSize="8"
                    :duration="4000"
                    :force="1"
                    :colors="['#FF4755', '#98DB7C', '#000000']"
                  />
                  <div v-if="!showButtonLoading">{{ t("buttons.goToSpace") }}</div>
                  <carbon:chevron-right v-if="!showButtonLoading" class="ml-s" />
                </button>
              </div>
            </section>
          </div>
        </keep-alive>
      </Transition>
    </div>
  </div>

  <!-- Toast -->
  <Transition name="slide-up">
    <Toast v-if="toastOpen === true" toastTheme="successToast" :toastType="toastType" />
  </Transition>
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
    position: relative;
    min-width: 30rem;
    max-width: 95vw; // mobile
    padding: 2rem;

    border-radius: $borderRadius;
    border: 1px solid var(--border);
    background-color: var(--bg-100);

    box-shadow: 0px 3px 10px 2px var(--shadow);

    .content__close-modal-btn {
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
    }

    .content__step {
      width: inherit;

      .step__title {
        margin-bottom: 1.5rem;
      }
      .step__title-centered {
        text-align: center;
      }
      /*  .step__description {
        font-size: 0.9rem;
        color: var(--pale-font);
        margin-bottom: 1rem;
      } */

      .step-one__form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .step-two__form {
        display: flex;
        gap: 2rem;
        align-items: start;
        justify-content: space-between;
        .form__left {
          .left__image {
            width: 20rem;
            height: auto;
            object-fit: contain;
            border-radius: $borderRadius;
          }
        }
        .form__right {
          .right__top {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            padding-bottom: 2rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--border);

            .top__buttons {
              display: flex;
              gap: 1rem;
            }
          }
          .right__bottom {
            .bottom__title {
              display: flex;
              justify-content: space-between;
            }
          }

          .right__title {
            font-weight: bold;
          }
          .right__space-size-selector {
            margin-top: 0.4rem;
            .space-size-selector__slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 6px;
              background-color: #ddd;
              outline: none;
              opacity: 0.8;
              transition: opacity 0.2s;
              cursor: pointer;
              &:hover {
                opacity: 1;
              }

              &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 1.2rem;
                height: 1.2rem;
                background-color: var(--primary-100);
                border-radius: 50%;
                box-shadow: 0px 0px 0px 2px var(--text-100);
                cursor: pointer;
              }
            }
            .space-size-selector__step-labels {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.2rem 0.3rem;
            }

            .step-labels__label {
              &:nth-child(2) {
                margin-left: 0.6rem;
              }
              &:nth-child(3) {
                margin-left: 0.4rem;
              }
              &:nth-child(4) {
                margin-right: -0.5rem;
              }
            }
          }
        }
      }

      .step_bottom-controls {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .bottom-controls__current-step {
          font-size: 0.9rem;
          color: var(--pale-font);
        }
      }
    }

    .content__space-created {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .content__space-url {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;

      .space-url__input {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
    }
  }

  @include s-576 {
    overflow-y: scroll;
    .create-space-modal__content {
      max-height: 95vh;
      overflow-y: auto;
      min-width: 98vw;
      padding: 2rem 1rem;
      .content__step {
        .step-two__form {
          flex-direction: column;
          .form__left {
            width: 100%;

            .left__image {
              width: 100%;
            }
          }
          .form__right {
            width: 100%;
          }
        }
        .step_bottom-controls {
        }
        .content__space-url {
          .space-url__input {
            flex-direction: column;
          }
        }
      }
    }
  }
}
</style>
