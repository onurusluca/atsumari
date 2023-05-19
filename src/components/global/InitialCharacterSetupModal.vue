<script setup lang="ts">
import type { Ref } from "vue";

const { t } = useI18n();
const authStore = useAuthStore();
// const router = useRouter();

const props = defineProps<{
  spaceId: string;
}>();
const emit = defineEmits(["initialSetupCompleted"]);

onMounted(async () => {
  await handleReadProfile();
  await downloadCharacterSpriteSheets();
});
/****************************************
 * API CALLS
 ****************************************/

let nameChanged = ref<boolean>(false);

let userName = ref<string>("");
let allUserNames = reactive<Array<Object>>([]);
const handleUpdateProfile = async () => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        user_name_for_each_space: allUserNames,
        character_sprite: selectedCharacterSpriteSheetName.value,
      })
      .eq("id", authStore?.session?.user?.id);
    if (error) {
      throw error;
    } else {
      nameChanged.value = true;
      showButtonLoading.value = false;
      emit("initialSetupCompleted");
      console.log("1. EMITTED INITIAL SETUP COMPLETED");
    }
  } catch (error: any) {
    console.log("CHANGE username CATCH ERROR: ", error.message);
  }
};

const handleReadProfile = async () => {
  try {
    let { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authStore?.session?.user?.id);

    if (profiles[0].user_name_for_each_space !== null) {
      allUserNames = profiles[0].user_name_for_each_space;
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ PROFILES CATCH ERROR: ", error.message);
  }
};

type AllSpriteSheets = {
  data: Array<Object>;
  error: Object;
};

type SpriteSheet = {
  name: string;
  img: string;
};

let allSpriteSheets = reactive<AllSpriteSheets>({ data: [], error: {} });
let characterSpriteSheets = reactive<Array<SpriteSheet>>([]);
let selectedCharacterSpriteSheet = ref<string>("");
let selectedCharacterSpriteSheetName = ref<string>("");
const downloadCharacterSpriteSheets = async () => {
  try {
    // List all sprite sheets
    allSpriteSheets = await supabase.storage
      .from("character-sprites")
      .list("characters", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (allSpriteSheets.data) {
      // For each sprite sheet, download it
      allSpriteSheets.data.forEach(async (spriteSheet: any, index: number) => {
        const { data, error } = await supabase.storage
          .from("character-sprites")
          .download("characters/" + spriteSheet.name);

        if (data) {
          const url = URL.createObjectURL(data);

          // Don't add the first sprite sheet to the array, as it's an "emptyFolderPlaceholder" used by Supabase
          if (index === 0) {
            selectedCharacterSpriteSheet.value = url;
            return;
          }
          characterSpriteSheets.push({ name: spriteSheet.name, img: url });

          // Set the first sprite sheet as the selected one
          if (characterSpriteSheets.length > 0) {
            selectedCharacterSpriteSheet.value = characterSpriteSheets[1]?.img;
          }
        }
        if (error) throw error;
      });
    }
  } catch (error: any) {
    console.log("DOWNLOAD CHARACTER SPRITE SHEET CATCH ERROR: ", error.message);
  }
};

/****************************************
 * UI EVENTS
 ****************************************/

let showButtonLoading = ref<boolean>(false);
let buttonsActive = ref<boolean>(true);

const handleClickOnConfirm = async () => {
  buttonsActive.value = false;

  allUserNames.push({
    [props.spaceId]: userName.value,
  });

  showButtonLoading.value = true;
  await handleUpdateProfile();
};

// Canvas stuff to display character sprite sheets
const canvas: Ref<HTMLCanvasElement | null> = ref(null);

watch(selectedCharacterSpriteSheet, (newVal) => {
  if (canvas.value) {
    const ctx = canvas.value.getContext("2d");
    if (ctx && newVal) {
      drawSprite(ctx, newVal);
    }
  }

  // Set the selected sprite sheet name
  const selectedSprite = characterSpriteSheets.find(
    (spriteSheet) => spriteSheet.img === newVal
  );
  if (selectedSprite) {
    selectedCharacterSpriteSheetName.value = selectedSprite.name;
  }
});

const drawSprite = (ctx: CanvasRenderingContext2D, spriteSheet: string) => {
  ctx.clearRect(0, 0, 128, 128);
  ctx.imageSmoothingEnabled = false;

  const img = new Image();
  img.src = spriteSheet;
  img.onload = () => {
    // drawing first [0x16] sprite, assuming a sprite sheet 32px per sprite
    ctx.drawImage(img, 0, 0, 16, 16, 0, 0, 128, 128);
  };
};
</script>
<template>
  <div class="initial-character-setup-modal">
    <div class="initial-character-setup-modal__content">
      <form
        v-if="!nameChanged"
        @submit.prevent="handleClickOnConfirm"
        class="content__form"
      >
        <h5 class="mb-xl">{{ t("user.setUserName.setAUserNameForThisSpace") }}</h5>
        <div class="form__input-single form__name-input">
          <label for="userName" class="form__label">{{
            t("user.setUserName.userName")
          }}</label>
          <!-- @input is for mobile(v-model won't update until input loses focus): https://github.com/vuejs/vue/issues/8231 -->
          <input
            v-model="userName"
            @input="(e: Event) => (userName = (e.target as HTMLInputElement)?.value)"
            type="text"
            required
            maxlength="30"
            :placeholder="t('user.setUserName.userNamePlaceholder')"
            class="form__text-input"
          />
        </div>

        <!-- Character sprite selection -->
        <section class="form__sprites-container">
          <canvas
            ref="canvas"
            width="128"
            height="128"
            class="sprites-container__sprites"
          ></canvas>
          <select
            v-model="selectedCharacterSpriteSheet"
            class="sprites-container__select form__text-input"
          >
            <option
              v-for="(spriteSheet, index) in characterSpriteSheets"
              :key="index"
              :value="spriteSheet.img"
            >
              {{ spriteSheet.name }}
            </option>
          </select>
        </section>

        <!-- Buttons -->
        <div class="form__bottom mt-xxl">
          <!-- Cancel -->
          <!--      <button
            @click.prevent="onClickCancel"
            :disabled="!buttonsActive"
            class="btn btn-outline mr-l"
          >
            {{ t("buttons.cancel") }}
          </button> -->

          <!-- Confirmation -->
          <button
            :disabled="!buttonsActive || userName === ''"
            class="btn btn-create"
            type="submit"
          >
            <ph:check-circle v-if="!showButtonLoading" class="mr-s" />
            <div v-if="!showButtonLoading">{{ t("buttons.complete") }}</div>
            <svg-spinners:90-ring-with-bg v-show="showButtonLoading" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<style scoped lang="scss">
.initial-character-setup-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  // Glassmorphism
  backdrop-filter: blur(2px);

  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: var(--modal-overlay);
  overflow: hidden;

  z-index: $modal-z-index;

  .initial-character-setup-modal__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 30rem;
    max-width: 90vw; //mobile
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
      .form__name-input {
        margin-bottom: 3rem;
      }

      .form__sprites-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .sprites-container__sprites {
          background-color: rgb(132, 0, 255);
          padding: 1rem;
          border-radius: 1rem;
        }
      }

      .form__bottom {
        display: flex;
        align-items: center;
        justify-content: start;
      }
    }
  }
}
</style>
