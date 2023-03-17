<script setup lang="ts">
import type { SpacesType } from "@/api/types";
import type { OnClickOutsideHandler } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

let userSpaces = ref<SpacesType[]>([]);
let showContentLoadingPlaceholder = ref<boolean>(true);
let showNoSpacesMessage = ref<boolean>(false);
onMounted(async () => {
  if (!authStore.session) {
    router.push({ name: "Login" });
  }

  await handleReadSpace();
});

/****************************************
 * API CALLS
 ****************************************/

const handleReadSpace = async () => {
  try {
    let { data: spaces, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("user_id", authStore?.session?.user?.id);
    if (spaces) {
      // Hide loading placeholder
      showContentLoadingPlaceholder.value = false;

      userSpaces.value = spaces;

      // Show no spaces message if user has no spaces
      if (userSpaces.value.length <= 0) {
        console.log("userSpaces.value.length: ", userSpaces.value.length);

        showNoSpacesMessage.value = true;
      } else {
        showNoSpacesMessage.value = false;
      }
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ SPACE CATCH ERROR: ", error.message);
  }
};

// Delete space

const handleDeleteSpace = async (spaceId: string) => {
  settingsMenuDropDownOpen.value = false;
  try {
    let { data: spaces, error } = await supabase
      .from("spaces")
      .delete()
      .eq("id", spaceId);
    if (spaces) {
      await handleReadSpace();
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("DELETE SPACE CATCH ERROR: ", error.message);
  }
};

// Realtime
supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "spaces" },
    async () => {
      console.log("Spaces changed!");
      await handleReadSpace();
    }
  )
  .subscribe();

/****************************************
 * UI
 ****************************************/

// Settings menu dropdown
const settingsMenuDropDownOpen = ref<Boolean>(false);
let settingsMenuDropDownIndex = ref<number>(0);
// Open based on index
const openSettingsMenu = (index: number) => {
  if (settingsMenuDropDownOpen.value === false) {
    settingsMenuDropDownOpen.value = true;
  } else if (settingsMenuDropDownOpen.value === true) {
    settingsMenuDropDownOpen.value = false;
  }
  settingsMenuDropDownIndex.value = index;
};

const clickOutsideHandlersettingsMenuDrowpdown: OnClickOutsideHandler = () => {
  settingsMenuDropDownOpen.value = false;
};

// Space name as slug logic
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

// Copy
const onCopyToClipboard = (spaceUrl: string) => {
  navigator.clipboard.writeText(spaceUrl);
  showToast("copiedNotification");
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

// TEMPORARY: random seed maker for space image:

let generateRandomSeeds = computed(() => {
  let seeds = [];

  for (let i = 0; i < 10; i++) {
    seeds.push(Math.floor(Math.random() * 100));
  }
  return seeds;
});
</script>

<template>
  <div class="home">
    <ul class="home__spaces" v-if="userSpaces.length > 0"
      ><li v-for="(item, index) in userSpaces" :key="index" class="spaces__space">
        <!-- Top -->
        <div class="space__top">
          <p class="top__title">{{ item.name }}</p>
          <div class="top__space-settings">
            <button @click.stop="openSettingsMenu(index)" class="btn btn-icon">
              <ph:dots-three-outline-fill style="color: black; font-size: 1.2rem" />
            </button>

            <!-- Settings menu -->
            <!-- Language menu dropdown -->
            <Transition name="fade">
              <ul
                v-if="settingsMenuDropDownOpen && settingsMenuDropDownIndex === index"
                v-on-click-outside.bubble="clickOutsideHandlersettingsMenuDrowpdown"
                class="space-settings__menu-dropdown dropdown-menu"
              >
                <li class="dropdown-menu__item">
                  <router-link
                    :to="{
                      name: 'SpaceSettings',
                      params: {
                        id: item.id,
                      },
                    }"
                  >
                    {{ t("space.menu.manageSpace") }}
                  </router-link>
                </li>
                <li class="dropdown-menu__item">
                  <router-link :to="`/space-edit/${item.id}`">
                    {{ t("space.menu.editMap") }}
                  </router-link>
                </li>
              </ul>
            </Transition>
          </div>
        </div>

        <!-- Image -->
        <div class="space__image-container">
          <img
            :src="`https://picsum.photos/seed/${generateRandomSeeds[index]}/600/300`"
            :alt="t('space.spaceImageAlt')"
            class="image-container__image"
          />

          <!-- Go to space -->
          <!-- :to="`/room/${item.id}`" -->
          <router-link
            class="btn btn-save image-container__enter-btn"
            :to="{
              name: 'Room',
              params: {
                id: item.id,
                name: slugify(item.name),
              },
            }"
          >
            {{ t("space.enterSpace") }}
            <radix-icons:enter class="ml-s" />
          </router-link>
        </div>

        <!-- Bottom -->
        <div class="space__bottom">
          <div class="bottom__left">
            <carbon:dot-mark
              style="
                font-size: 1.2rem;
                color: var(--online-count-green);
                margin-right: 0.2rem;
              "
            />
            <p>30 {{ t("space.onlineCount") }}</p>
          </div>
          <div class="bottom__right">
            <!-- Copy space URL -->
            <!-- TODO: change to real root route -->
            <button
              @click="
                onCopyToClipboard(
                  `http://localhost:5173/room/${item.id}/${slugify(item.name)}`
                )
              "
              class="btn btn-icon"
            >
              <carbon:copy
                style="font-size: 1rem; color: var(--text-100); margin-right: 0.5rem"
              />
              {{ t("space.copySpaceUrl") }}
            </button>
          </div>
        </div>
      </li></ul
    >
    <!-- clp -->
    <!-- TODO: Enable if it takes too much time to load spaces -->
    <!--  <div v-if="showContentLoadingPlaceholder" class="clp-container">
      <div class="clp"></div>
      <div class="clp"></div>
      <div class="clp"></div>
      <div class="clp"></div>
    </div> -->

    <!-- No spaces -->
    <div v-if="showNoSpacesMessage" class="home__no-spaces">
      <fluent-emoji:sad-but-relieved-face style="font-size: 5rem" />
      <p class="no-spaces__message">
        {{ t("home.spaces.noSpacesMessage") }}
      </p>
    </div>
  </div>

  <!-- Toast -->
  <Transition name="slide-up">
    <Toast v-if="toastOpen === true" toastTheme="successToast" :toastType="toastType" />
  </Transition>
</template>

<style scoped lang="scss">
.home {
  padding: 1rem;
  .home__spaces {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    .spaces__space {
      position: relative;

      width: 28rem;
      min-width: 20rem;

      border: 2px solid var(--border);
      border-radius: $borderRadius;

      transition: border 100ms ease;

      .space__top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .top__title {
          font-size: 1.2rem;
          font-weight: 600;
          padding: 0 0.8rem;
        }
        .top__space-settings {
          .space-settings__menu-dropdown {
            position: absolute;
            top: 2.2rem;
            right: 0;
          }
        }
      }
      .space__image-container {
        position: relative;
        height: 14rem;
        padding: 0.4rem 0.8rem;

        &:hover {
          .image-container__image {
            transition: filter 100ms ease;

            filter: brightness(0.9);
          }
          .image-container__enter-btn {
            transition: visibility 100ms ease;
            visibility: visible;
          }
        }
        .image-container__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: $borderRadius;
        }
        .image-container__enter-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          visibility: hidden;
        }
      }
      .space__bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem 0.3rem 0.5rem;

        .bottom__left {
          display: flex;
        }
        .bottom__right {
        }
      }
    }
  }
  .home__no-spaces {
    // Center
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 60vh;
    .no-spaces__message {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-300);
    }
  }

  .clp-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    .clp {
      width: 30rem;
      min-width: 20rem;

      padding: 1rem;

      border: 1px solid var(--border);
      border-radius: $borderRadius;
    }
  }
}
</style>
