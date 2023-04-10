<script setup lang="ts">
import type { ProfilesType } from "@/api/types/index";

const { t } = useI18n();
const authStore = useAuthStore();
// const router = useRouter();

const props = defineProps<{
  spaceId: string;
}>();
const emit = defineEmits(["initialSetupCompleted"]);

onMounted(async () => {
  await handleReadProfile();
});
/****************************************
 * API CALLS
 ****************************************/

let nameChanged = ref<boolean>(false);

let userName = ref<string>("");
let allUserNames = reactive<Array<Object>>([]);
const handleChangeUserName = async () => {
  try {
    console.log("allUserNames: ", allUserNames);

    const { error } = await supabase
      .from("profiles")
      .eq("id", authStore?.session?.user?.id)
      .update({ user_name_for_each_space: allUserNames });

    if (error) {
      throw error;
    } else {
      nameChanged.value = true;
      showButtonLoading.value = false;
      emit("initialSetupCompleted");
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
      console.log("allUserNames: ", allUserNames);
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ PROFILES CATCH ERROR: ", error.message);
  }
};

/****************************************
 * UI EVENTS
 ****************************************/

let showButtonLoading = ref<boolean>(false);
let buttonsActive = ref<boolean>(true);

const handleClickOnConfirm = async () => {
  allUserNames.push({
    [props.spaceId]: userName.value,
  });

  buttonsActive.value = false;
  showButtonLoading.value = true;
  await handleChangeUserName();
};
</script>
<template>
  <div class="change-username-modal">
    <div class="change-username-modal__content">
      <form
        v-if="!nameChanged"
        @submit.prevent="handleClickOnConfirm"
        class="content__form"
      >
        <h5 class="mb-xl">{{ t("user.setUserName.setAUserNameForThisSpace") }}</h5>
        <div class="form__input-single">
          <label for="userName" class="form__label">{{
            t("user.setUserName.userName")
          }}</label>
          <input
            v-model="userName"
            type="text"
            required
            maxlength="30"
            :placeholder="t('user.setUserName.userNamePlaceholder')"
            class="form__text-input"
          />
        </div>

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
.change-username-modal {
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

  .change-username-modal__content {
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

      .form__bottom {
        display: flex;
        align-items: center;
        justify-content: start;
      }
    }
  }
}
</style>
