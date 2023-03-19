<script setup lang="ts">
import type { OnClickOutsideHandler } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import CreateSpaceModal from "@/components/global/CreateSpaceModal.vue";
import { isDark, toggleDarkMode } from "@/utils/dark";

const authStore = useAuthStore();
const router = useRouter();

/****************************************
 * API CALLS
 ****************************************/
// Logout
const logOut = async () => {
  try {
    const { error, data } = await supabase.auth.signOut();
    if (data) {
      console.log("LOGOUT DATA: ", data);

      router.push({ name: "Home" });
    }
    if (error) throw error;
  } catch (error: any) {
    alert(error.message);
  }
};

/****************************************
 * UI
 ****************************************/

// Language
const { t, locale } = useI18n();
const changeLanguage = (lang: string) => {
  locale.value = lang;
  useStorage("atsumari_local-storage", { language: lang });
};

// User menu dropdown
const userMenuDropdownOpen = ref<Boolean>(false);
const clickOutsideHandlerDrowpdown: OnClickOutsideHandler = (event) => {
  userMenuDropdownOpen.value = false;
};

// Dark&Light mode
function changeThemeDarkMode() {
  toggleDarkMode();
  // window.location.reload();
}

// Language menu dropdown
const languageMenuDropdownOpen = ref<Boolean>(false);
const clickOutsideHandlerLanguageDrowpdown: OnClickOutsideHandler = (event) => {
  languageMenuDropdownOpen.value = false;
};

// Modal
let showModal = ref<boolean>(false);
</script>

<template>
  <div class="navbar">
    <div class="navbar__left">
      <div class="left__icon-container">
        <router-link :to="{ name: 'Home' }">
          <img
            src="@/assets/images/icons/icon-64.png"
            alt="Atsumari 🍉"
            title="Atsumari 🍉"
            class="icon-container__icon"
          />
        </router-link>
      </div>
    </div>
    <div class="navbar__right">
      <button @click.stop="showModal = !showModal" class="btn btn-create mr-xxl">
        <ri:add-circle-line class="mr-xs" style="font-size: 1.3rem" />
        {{ t("space.createSpace.title") }}
      </button>

      <!--  <button class="btn-icon mr-l">
        <carbon:settings style="font-size: 1.7rem" />
      </button> -->

      <button
        @click.stop="userMenuDropdownOpen = !userMenuDropdownOpen"
        class="btn btn-no-style right__avatar"
      >
        <img src="@/assets/images/mockup/avatar.png" class="avatar__img" />
        <!--   <ri:account-circle-line style="font-size: 3rem; color: #5b5b5b" /> -->
      </button>

      <!-- Dropdown -->
      <Transition name="slide-down-up">
        <div
          v-if="userMenuDropdownOpen && authStore?.session?.user"
          v-on-click-outside.bubble="clickOutsideHandlerDrowpdown"
          class="user-menu-dropdown dropdown-menu"
        >
          <!-- TODO: add image -->
          <img
            src="@/assets/images/mockup/avatar.png"
            alt="Avatar"
            class="user-menu-dropdown__avatar"
          />

          <!-- TODO: add name -->
          <!-- <p class="user-menu-dropdown__name">{{ authStore?.session?.user.name }}</p> -->

          <p class="user-menu-dropdown__email">{{ authStore?.session?.user.email }}</p>

          <!-- Edit character -->
          <router-link to="" class="btn btn-no-style mt-s">
            <gridicons:customize class="mr-s" style="font-size: 1rem" />
            {{ t("user.editCharacter") }}
          </router-link>

          <span class="user-menu-dropdown__divider"></span>

          <!-- Dark&light mode -->
          <button @click="changeThemeDarkMode" class="btn btn-no-style mb-xs">
            <carbon:moon v-if="!isDark" class="mr-s" style="font-size: 1rem" />
            <carbon:sun v-else class="mr-s" style="font-size: 1rem" />
            {{ t("appearance.appearance") }}
          </button>

          <!-- Language -->
          <button
            @click.stop="languageMenuDropdownOpen = !languageMenuDropdownOpen"
            class="btn btn-no-style ml-s"
          >
            <carbon:ibm-watson-language-translator
              class="mr-s"
              style="font-size: 1rem"
            />
            {{ t("language.language") }}
            <carbon:chevron-down class="ml-s" style="font-size: 0.8rem" />
          </button>

          <!-- Language menu dropdown -->
          <Transition name="slide-down-up">
            <div
              v-if="languageMenuDropdownOpen"
              v-on-click-outside.bubble="clickOutsideHandlerLanguageDrowpdown"
              class="language-menu-dropdown__user-menu-dropdown dropdown-menu"
            >
              <button class="btn btn-no-style" @click="changeLanguage('en')">
                {{ t("language.english") }}
              </button>
              <button class="btn btn-no-style" @click="changeLanguage('ja')">
                {{ t("language.japanese") }}
              </button>
            </div>
          </Transition>

          <span class="user-menu-dropdown__divider"></span>

          <!-- Logout -->
          <button className="btn btn-danger" @click="logOut">{{
            t("auth.logout")
          }}</button>
        </div>
      </Transition>
    </div>
  </div>
  <Transition name="fade">
    <CreateSpaceModal v-if="showModal" @close-modal="showModal = false" />
  </Transition>
</template>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-between;

  padding-right: 0.5rem;
  height: 5rem;

  background-color: var(--bg-100);
  border-bottom: 1px solid var(--border);

  z-index: $navbar-z-index;

  .navbar__left {
    .left__icon-container {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 6rem;
      height: 5rem;

      border-right: 1px solid var(--border);

      .icon-container__icon {
        width: 2.5rem;
        height: 2.5rem;
        cursor: pointer;
      }
    }
  }
  .navbar__right {
    display: flex;
    align-items: center;

    .right__avatar {
      background-color: var(--brand-green);
      border-radius: 50%;
      padding: 0;

      .avatar__img {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    // User menu dropdown
    .user-menu-dropdown {
      position: absolute;
      top: 5rem;
      right: 1rem;

      display: flex;
      align-items: center;
      justify-content: flex-end;

      padding: 2rem 0.5rem 1rem 0.5rem;
      min-width: 15rem;
      width: max-content;

      .user-menu-dropdown__avatar {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        object-fit: cover;

        background-color: var(--brand-green);
      }

      .user-menu-dropdown__name {
      }
      .user-menu-dropdown__email {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-200);
      }
      .user-menu-dropdown__divider {
        margin: 1rem 0;
        width: 60%;
        height: 1px;
        background-color: var(--border);
      }
      .language-menu-dropdown__user-menu-dropdown {
        position: absolute;
        bottom: 0.5rem;
      }
    }
  }

  @include m-768 {
  }

  @include s-576 {
    height: 4rem;

    .navbar__left {
      .left__icon-container {
        width: 5rem;
        height: 4rem;

        .icon-container__icon {
          width: 2.5rem;
          height: 2.5rem;
        }
      }
    }
  }
}
</style>
