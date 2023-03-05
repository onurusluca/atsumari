<script setup lang="ts">
import type { OnClickOutsideHandler } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'
import CreateSpaceModal from '@/components/global/CreateSpaceModal.vue'

const authStore = useAuthStore()
const router = useRouter()

/****************************************
 * API CALLS
 ****************************************/
// Logout
const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    console.log('signout')

    if (error) throw error
  } catch (error: any) {
    alert(error.message)
  }
}

/****************************************
 * UI EVENTS
 ****************************************/

// Language
const { t, locale } = useI18n()
const changeLanguage = (lang: string) => {
  locale.value = lang
  useStorage('atsumari_local-storage', { language: lang })
}

// Dropdown
const userDropdownOpen = ref<Boolean>(false)
const clickOutsideHandlerDrowpdown: OnClickOutsideHandler = (event) => {
  userDropdownOpen.value = false
}

// Modal
let showModal = ref<boolean>(false)
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
        <ri:add-line class="mr-xs" style="font-size: 1.3rem" />
        {{ t('space.createSpace') }}
      </button>

      <!--  <button class="btn-icon mr-l">
        <carbon:settings style="font-size: 1.7rem" />
      </button> -->

      <button
        @click.stop="userDropdownOpen = !userDropdownOpen"
        class="btn btn-no-style right__avatar"
      >
        <img src="@/assets/images/mockup/avatar.png" alt="Avatar" class="avatar__img" />
        <!--   <ri:account-circle-line style="font-size: 3rem; color: #5b5b5b" /> -->
      </button>

      <Transition name="slide-down-up">
        <div
          v-if="userDropdownOpen"
          v-on-click-outside.bubble="clickOutsideHandlerDrowpdown"
          class="user-menu-dropdown dropdown-menu"
        >
          <h1>fsdfsdf</h1>
        </div>
      </Transition>
    </div>

    <Transition name="fade">
      <CreateSpaceModal v-if="showModal" @close-modal="showModal = false" />
    </Transition>
  </div>
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
        width: 3rem;
        height: 3rem;
        cursor: pointer;
      }
    }
  }
  .navbar__right {
    display: flex;
    align-items: center;

    .right__avatar {
      background-color: var(--primary-200);
      border-radius: 30%;
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
