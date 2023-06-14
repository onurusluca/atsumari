<script setup lang="ts">
import type { OnClickOutsideHandler } from "@vueuse/core";
import type { User } from "@/types/canvasTypes";

import { vOnClickOutside } from "@vueuse/components";
import createGame from "@/game";

import { handleReadProfile } from "@/composables/useProfileHandler";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRouter();
const spaceId = String(route.currentRoute.value.params.id);
const spaceName = String(route.currentRoute.value.params.name);

let initialSetupCompleted = ref<Boolean>(true);

let users = reactive<Array<User>>([]);

onMounted(async () => {
  generalStore.spaceId = spaceId;
  generalStore.spaceName = spaceName;
  generalStore.users = users;

  await handleReadAndSetProfileStuff().then(() => {
    if (initialSetupCompleted.value) {
      createGame();
    }
  });
});
onUnmounted(() => {
  emitter.emit("destroyGame");
});

// After all the initial setups are done in the modal, do the preparations
const handleInitialSetupCompleted = async () => {
  initialSetupCompleted.value = true;
  await handleReadAndSetProfileStuff().then(() => {
    if (initialSetupCompleted.value) {
      createGame();
    }
  });
};

const handleReadAndSetProfileStuff = async () => {
  const profileData = await handleReadProfile(authStore.user.id, spaceId);
  if (profileData.error) {
    console.error(profileData.error);
  } else {
    generalStore.userName = profileData.userName;
    generalStore.characterSpriteName = profileData.characterSpriteName;
    initialSetupCompleted.value = profileData.initialSetupCompleted;
  }
};

/****************************************
 * UI
 ****************************************/

const chatMenuOpen = ref<Boolean>(false);
const onlineUsersMenuOpen = ref<Boolean>(false);

// Main menu
let mainMenuOpen = ref<Boolean>(false);
const mainMenuClickOutsideHandler: OnClickOutsideHandler = () => {
  mainMenuOpen.value = false;
};

const handleOnlineUsersMenuOpen = () => {
  chatMenuOpen.value = false;
  onlineUsersMenuOpen.value = !onlineUsersMenuOpen.value;
};
const handleChatMenuOpen = () => {
  onlineUsersMenuOpen.value = false;
  chatMenuOpen.value = !chatMenuOpen.value;
};

// Set document head tag
useHead({
  title: `Atsumari 🍉 |  ${spaceName}`,
});
</script>

<template>
  <!-- Loading animation to show until app mount -->
  <!--  <section v-if="!canvasLoaded" class="route-loading-overlay">
    <span class="loader"></span>
  </section> -->

  <div class="space">
    <!-- Bottom control -->
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
        <div class="left__media-sharing">
          <MicCameraScreen />
        </div>
        <div class="left__emotes"></div>
      </div>

      <div class="bottom-control__right">
        <!-- Chat -->
        <div class="right__chat">
          <button
            @click.stop="handleChatMenuOpen"
            class="btn-bottom-control"
            :title="t('chat.title')"
          >
            <ph:chats-circle class="bottom-control__icon" />
          </button>
          <Transition name="slide-left-fast">
            <Chat
              v-show="chatMenuOpen"
              :chat-opened="chatMenuOpen"
              class="chat__chat-menu"
            />
          </Transition>
        </div>
        <div class="right__user-list">
          <button
            @click.stop="handleOnlineUsersMenuOpen"
            class="btn-bottom-control"
            :title="t('onlineUsers.title')"
          >
            <ph:users-three class="bottom-control__icon" />
          </button>
          <Transition name="slide-left-fast">
            <OnlineUsers
              v-show="onlineUsersMenuOpen"
              :online-users="users"
              class="chat__chat-menu"
            />
          </Transition>
        </div>
      </div>
    </div>

    <!-- LiveKit Stuff -->
    <section class="space__webrtc">
      <Conference />
    </section>

    <!-- Joystick for mobile -->
    <Joystick />

    <!-- Initial setup modal -->
    <InitialCharacterSetupModal
      v-if="!initialSetupCompleted"
      :space-id="spaceId"
      @initial-setup-completed="handleInitialSetupCompleted"
    />
  </div>
</template>

<style scoped lang="scss">
.space {
  background-color: #222;
  .canvas-container {
    /*   width: 100%;
    height: 100vh; */

    .canvas-container__right-click-menu {
      position: absolute;
      z-index: 1000;
      background-color: var(--bg-300);
      color: var(--text-100);
      outline: 2px solid var(--border);

      &:hover {
        background-color: var(--soft-hover);
      }
    }
  }

  .bottom-control {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 3.5rem;
    margin: 0;
    padding: 0 1rem;

    background-color: var(--bg-300);
    border-top: 1px solid var(--border);

    z-index: $space-bottom-control-z-index;

    // create class names for each element with no styles
    .bottom-control__left {
      display: flex;
      align-items: center;
      gap: 1rem;
      .left__main-menu {
        .main-menu__btn {
          background-color: var(--primary-100);
          transition: background-color 50ms ease-in-out;

          width: 2.5rem;
          height: 2.5rem;
          &:hover {
            background-color: #3ecbf1;
          }
          .btn__icon {
            width: 2rem;
            height: 2rem;
            margin: 0.2rem 0;
          }
        }
      }
      /*    .left__user-menu {
      }
      .left__media-sharing {
      }
      .left__emotes {
      } */
    }

    .bottom-control__right {
      display: flex;
      align-items: center;
      /*      .right__chat {
        .chat__chat-menu {
        }
      } */
      .right__user-list {
        margin-left: 1rem;
      }
    }

    .btn-bottom-control {
      padding: 0.2rem 0.5rem;
      font-size: 0.9rem;
      .bottom-control__icon {
        width: 1.8rem;
        height: 1.8rem;
      }
    }
  }

  .space__webrtc {
    position: fixed;
    bottom: 5rem;
    border: 5px solid red;
  }
}
</style>
