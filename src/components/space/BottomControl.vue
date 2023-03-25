<script setup lang="ts">
import type { OnClickOutsideHandler } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

let spaceId = route.currentRoute.value.params;

const spaceLocalStorage = useStorage("atsumari_space", {
  chatOpen: false,
  onlineUsersOpen: false,
});

onMounted(() => {
  if (spaceLocalStorage.value.chatOpen) {
    chatMenuOpen.value = true;
    generalStore.rightSideMenuOpen = true;
  }
  if (spaceLocalStorage.value.onlineUsersOpen) {
    onlineUsersMenuOpen.value = true;
    generalStore.rightSideMenuOpen = true;
  }
});

/****************************************
 * UI
 ****************************************/

const chatMenuOpen = ref<Boolean>(false);
const onlineUsersMenuOpen = ref<Boolean>(false);

// Main menu
let mainMenuOpen = ref<Boolean>(false);
const mainMenuClickOutsideHandler: OnClickOutsideHandler = (event) => {
  mainMenuOpen.value = false;
};

const handleChatMenuOpen = () => {
  onlineUsersMenuOpen.value = false;
  chatMenuOpen.value = !chatMenuOpen.value;

  // Set right side menu open on store to be used by Space.vue to update canvas size
  // Also set local storage to be used on page reload
  if (chatMenuOpen.value) {
    generalStore.rightSideMenuOpen = true;
    spaceLocalStorage.value.chatOpen = true;
  } else {
    generalStore.rightSideMenuOpen = false;
    spaceLocalStorage.value.chatOpen = false;
  }
};

const handleOnlineUsersMenuOpen = () => {
  chatMenuOpen.value = false;
  onlineUsersMenuOpen.value = !onlineUsersMenuOpen.value;

  if (onlineUsersMenuOpen.value) {
    generalStore.rightSideMenuOpen = true;
    spaceLocalStorage.value.onlineUsersOpen = true;
  } else {
    generalStore.rightSideMenuOpen = false;
    spaceLocalStorage.value.onlineUsersOpen = false;
  }
};
</script>

<template>
  <div class="bottom-control">
    <div class="bottom-control__left">
      <div class="left__main-menu">
        <button
          @click.stop="mainMenuOpen = !mainMenuOpen"
          class="btn-bottom-control main-menu__btn"
        >
          <img
            src="@/assets/images/icons/icon-64.png"
            alt="Atsumari 🍉"
            title="Atsumari 🍉"
            class="btn__icon"
          />
        </button>

        <!-- Main menu -->
        <Transition name="slide-up">
          <MainMenu
            v-if="mainMenuOpen"
            class="left__main-menu"
            ref="mainMenu"
            v-on-click-outside.bubble="mainMenuClickOutsideHandler"
          />
        </Transition>
      </div>
      <div class="left__user-menu"></div>
      <div class="left__media-sharing"></div>
      <div class="left__emotes"></div>
    </div>
    <div class="bottom-control__right">
      <!-- Chat -->
      <div class="right__chat">
        <button @click.stop="handleChatMenuOpen" class="btn-bottom-control">
          <ph:chats-circle class="bottom-control__icon" />
          <span>Chat</span>
        </button>
        <Transition name="slide-left-fast">
          <Chat v-show="chatMenuOpen" class="chat__chat-menu" />
        </Transition>
      </div>
      <div class="right__user-list">
        <button @click.stop="handleOnlineUsersMenuOpen" class="btn-bottom-control">
          <ph:users-three class="bottom-control__icon" />
          <span>Online</span>
        </button>
        <Transition name="slide-left-fast">
          <OnlineUsers v-show="onlineUsersMenuOpen" class="chat__chat-menu" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bottom-control {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 4rem;
  margin: 0;
  padding: 0 1rem;

  background-color: var(--bg-300);
  border-top: 1px solid var(--border);

  z-index: $space-bottom-control-z-index;

  // create class names for each element with no styles
  .bottom-control__left {
    .left__main-menu {
      .main-menu__btn {
        background-color: rgb(221, 192, 255);
        transition: background-color 50ms ease-in-out;

        width: 3rem;
        height: 3rem;
        &:hover {
          background-color: rgb(201, 154, 255);
        }
        .btn__icon {
          width: 2rem;
          height: 2rem;
          margin: 0.2rem 0;
        }
      }
    }
    .left__user-menu {
    }
    .left__media-sharing {
    }
    .left__emotes {
    }
  }

  .bottom-control__right {
    display: flex;
    align-items: center;
    .right__chat {
      .chat__chat-menu {
      }
    }
    .right__user-list {
      margin-left: 1rem;
    }
  }

  .btn-bottom-control {
    .bottom-control__icon {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}
</style>
