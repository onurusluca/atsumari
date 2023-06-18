<script setup lang="ts">
import type { SpacesType, VisitedSpacesType } from "@/types/supabaseTypes";
import type { OnClickOutsideHandler } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import { getCurrentUrlOrigin } from "@/utils/general";
import { slugify } from "@/utils/slugify";

const { t } = useI18n();
const authStore = useAuthStore();

let userSpaces = reactive<SpacesType[]>([]);
let visitedSpaces = reactive<VisitedSpacesType[]>([]);
let isUserSpacesLoaded = ref<boolean>(false);
let isVisitedSpacesLoaded = ref<boolean>(false);
let showNoUserSpacesMessage = ref<boolean>(false);
let showNoVisitedSpacesMessage = ref<boolean>(false);

onMounted(async () => {
  await handleReadUserSpaces();
});

/****************************************
 * API CALLS
 ****************************************/

const handleReadUserSpaces = async () => {
  try {
    let { data: spaces, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("user_id", authStore.session.user.id);
    if (spaces) {
      userSpaces = spaces;
      isUserSpacesLoaded.value = true;

      // Show no spaces message if user has no spaces
      if (userSpaces.length <= 0) {
        showNoUserSpacesMessage.value = true;
      } else {
        showNoUserSpacesMessage.value = false;
      }
    }
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.log("READ SPACE CATCH ERROR: ", error.message);
  }
};

const handleReadVisitedSpaces = async () => {
  try {
    let { data: spaces, error } = await supabase
      .from("visited_spaces")
      .select("*")
      .eq("user_id", authStore.session.user.id);
    if (spaces) {
      visitedSpaces = spaces;
      isVisitedSpacesLoaded.value = true;

      if (visitedSpaces.length <= 0) {
        showNoVisitedSpacesMessage.value = true;
      } else {
        showNoVisitedSpacesMessage.value = false;
      }
    }
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.log("READ SPACE CATCH ERROR: ", error.message);
  }
};

// Realtime
supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "spaces" },
    async () => {
      await handleReadUserSpaces();
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

// Copy
const onCopyToClipboard = (spaceUrl: string) => {
  navigator.clipboard.writeText(spaceUrl);
  showToast("copiedNotification");
};

// Tabs
let activeTab = ref<string>("userSpaces");
const changeTab = async (tab: string) => {
  activeTab.value = tab;
  if (activeTab.value === "visitedSpaces" && !isVisitedSpacesLoaded.value) {
    await handleReadVisitedSpaces();
  }
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
  }, 2000);
}
</script>

<template>
  <div class="home">
    <section class="home__tabs">
      <button
        @click="changeTab('userSpaces')"
        class="tabs__tab btn-no-style"
        :class="{ 'tabs__tab--active': activeTab === 'userSpaces' }"
      >
        {{ t("spaces.mySpaces") }}
      </button>
      <button
        @click="changeTab('visitedSpaces')"
        class="tabs__tab btn-no-style"
        :class="{ 'tabs__tab--active': activeTab === 'visitedSpaces' }"
      >
        {{ t("spaces.visitedSpaces") }}
      </button>
    </section>

    <!-- User spaces -->
    <ul class="home__spaces" v-if="isUserSpacesLoaded && activeTab === 'userSpaces'">
      <li v-for="(item, index) in userSpaces" :key="index" class="spaces__space">
        <!-- Top -->
        <div class="space__top">
          <p class="top__title">{{ item.name }}</p>
          <div class="top__space-settings">
            <button @click.stop="openSettingsMenu(index)" class="btn btn-icon">
              <ph:dots-three-outline-fill
                style="color: var(--text-100); font-size: 1.2rem"
              />
            </button>

            <!-- Settings menu -->
            <!-- Language menu dropdown -->
            <Transition name="fade">
              <div
                v-if="settingsMenuDropDownOpen && settingsMenuDropDownIndex === index"
                v-on-click-outside.bubble="clickOutsideHandlersettingsMenuDrowpdown"
                class="space-settings__menu-dropdown dropdown-menu"
              >
                <router-link
                  :to="{
                    name: 'SpaceSettings',
                    params: {
                      id: item.id,
                      name: item.name,
                    },
                  }"
                  tag="li"
                  class="btn btn-icon"
                >
                  <carbon:settings-services class="menu-list-icon" />
                  {{ t("spaces.menu.manageSpace") }}
                </router-link>
                <!-- Copy space URL -->
                <!-- TODO: change to real root route -->
                <button
                  @click="
                    onCopyToClipboard(
                      `${getCurrentUrlOrigin()}/space/${item.id}/${slugify(item.name)}`
                    )
                  "
                  class="btn btn-icon"
                >
                  <carbon:copy class="menu-list-icon" />
                  {{ t("spaces.copySpaceUrl") }}
                </button>

                <button class="btn btn-upgrade">
                  <ri:vip-crown-2-line class="menu-list-icon" />
                  {{ t("buttons.upgrade") }}
                </button>

                <!--     <router-link
                  :to="`/space-edit/${item.id}`"
                  tag="li"
                >
                  {{ t("spaces.menu.editMap") }}
                </router-link> -->
              </div>
            </Transition>
          </div>
        </div>

        <!-- Image -->
        <div class="space__image-container">
          <img
            src="@/assets/images/mockup/temporary-space-background.jpg"
            :alt="t('spaces.spaceImageAlt')"
            class="image-container__image"
          />

          <!-- Go to space -->
          <!-- :to="`/space/${item.id}`" -->
          <router-link
            class="btn btn-save image-container__enter-btn"
            :to="{
              name: 'Space',
              params: {
                id: item.id,
                name: slugify(item.name),
              },
            }"
          >
            {{ t("spaces.enterSpace") }}
            <radix-icons:enter class="ml-s" />
          </router-link>
        </div>

        <!-- Bottom -->
        <div class="space__bottom">
          <!--     <div class="bottom__left">
        // Online count
            <carbon:dot-mark
              style="
                font-size: 1.2rem;
                color: var(--online-count-green);
                margin-right: 0.2rem;
              "
            />
            <p>30 {{ t("spaces.onlineCount") }}</p>
          </div> -->
          <div class="bottom__right"> </div>
        </div>
      </li>
    </ul>

    <!-- Visited spaces -->
    <ul
      class="home__spaces"
      v-if="isVisitedSpacesLoaded && activeTab === 'visitedSpaces'"
    >
      <li v-for="(item, index) in visitedSpaces" :key="index" class="spaces__space">
        <!-- Top -->
        <div class="space__top">
          <p class="top__title">{{ item.name }}</p>
          <div class="top__space-settings">
            <button @click.stop="openSettingsMenu(index)" class="btn btn-icon">
              <ph:dots-three-outline-fill
                style="color: var(--text-100); font-size: 1.2rem"
              />
            </button>

            <!-- Settings menu -->
            <!-- Language menu dropdown -->
            <Transition name="fade">
              <div
                v-if="settingsMenuDropDownOpen && settingsMenuDropDownIndex === index"
                v-on-click-outside.bubble="clickOutsideHandlersettingsMenuDrowpdown"
                class="space-settings__menu-dropdown dropdown-menu"
              >
                <!-- Copy space URL -->
                <!-- TODO: change to real root route -->
                <button
                  @click="
                    onCopyToClipboard(
                      `${getCurrentUrlOrigin()}/space/${item.space_id}/${slugify(
                        item.name
                      )}`
                    )
                  "
                  class="btn btn-icon"
                >
                  <carbon:copy class="menu-list-icon" />
                  {{ t("spaces.copySpaceUrl") }}
                </button>

                <!--     <router-link
                  :to="`/space-edit/${item.id}`"
                  tag="li"
                >
                  {{ t("spaces.menu.editMap") }}
                </router-link> -->
              </div>
            </Transition>
          </div>
        </div>

        <!-- Image -->
        <div class="space__image-container">
          <img
            src="@/assets/images/mockup/temporary-space-background.jpg"
            :alt="t('spaces.spaceImageAlt')"
            class="image-container__image"
          />

          <!-- Go to space -->
          <!-- :to="`/space/${item.id}`" -->
          <router-link
            class="btn btn-save image-container__enter-btn"
            :to="{
              name: 'Space',
              params: {
                id: item.space_id,
                name: slugify(item.name),
              },
            }"
          >
            {{ t("spaces.enterSpace") }}
            <radix-icons:enter class="ml-s" />
          </router-link>
        </div>

        <!-- Bottom -->
        <div class="space__bottom">
          <!--     <div class="bottom__left">
        // Online count
            <carbon:dot-mark
              style="
                font-size: 1.2rem;
                color: var(--online-count-green);
                margin-right: 0.2rem;
              "
            />
            <p>30 {{ t("spaces.onlineCount") }}</p>
          </div> -->
          <div class="bottom__right"> </div>
        </div>
      </li>
    </ul>

    <!-- clp -->
    <!-- TODO: Enable if it takes too much time to load spaces -->
    <div
      v-if="
        (!isUserSpacesLoaded && activeTab === 'userSpaces' && userSpaces.length <= 0) ||
        (!isVisitedSpacesLoaded &&
          activeTab === 'visitedSpaces' &&
          visitedSpaces.length <= 0)
      "
      class="clp-container"
    >
      <div class="clp"></div>
      <div class="clp"></div>
      <div class="clp"></div>
      <div class="clp"></div>
    </div>

    <!-- No user spaces -->
    <div
      v-if="showNoUserSpacesMessage && activeTab === 'userSpaces'"
      class="home__no-spaces"
    >
      <fluent-emoji:sad-but-relieved-face style="font-size: 5rem" />
      <p class="no-spaces__message">
        {{ t("home.spaces.noSpacesMessage") }}
      </p>
    </div>

    <!-- No visited spaces -->
    <div
      v-if="showNoVisitedSpacesMessage && activeTab === 'visitedSpaces'"
      class="home__no-spaces"
    >
      <fluent-emoji:disappointed-face style="font-size: 5rem" />

      <p class="no-spaces__message">
        {{ t("home.spaces.noVisitedSpacesMessage") }}
        <br />
        {{ t("home.spaces.noVisitedSpacesMessage2") }}
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

  .home__tabs {
    display: flex;
    margin-bottom: 2rem;
    color: var(--pale);
    border-bottom: 2px solid var(--border-color);

    .tabs__tab {
      margin-right: 1rem;

      font-weight: bold;
      cursor: pointer;

      transition: background-color 0.1s ease-in-out;
    }
    .tabs__tab--active {
      border-bottom: 2px solid var(--success);
    }
  }

  .home__spaces {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    overflow-y: auto;

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

        padding: 0.2rem;
        .top__title {
          font-size: 1.2rem;
          font-weight: 600;
          padding: 0 0.8rem;
        }
        .top__space-settings {
          .space-settings__menu-dropdown {
            position: absolute;
            top: 2.5rem;
            right: -3rem;
            z-index: $menu-z-index;
          }
        }
      }
      .space__image-container {
        position: relative;
        height: 14rem;
        margin: 0.4rem;

        &:hover {
          .image-container__image {
            transition: filter 100ms ease;

            filter: brightness(0.3);
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
        /*     padding: 0.5rem 0.5rem 0.3rem 0.5rem; */

        .bottom__left {
          display: flex;
        }
        /*     .bottom__right {
        } */
      }
    }
  }

  .menu-list-icon {
    font-size: 1rem;
    margin-right: 0.5rem;
  }
  .home__no-spaces {
    // Center
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 60vh;
    .no-spaces__message {
      margin-top: 1rem;
      font-size: 1.4rem;
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
