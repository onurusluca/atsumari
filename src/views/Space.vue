<script setup lang="ts">
import type { OnClickOutsideHandler } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import { createCanvasApp } from "@/canvas/ts/Game";
import InitialCharacterSetupModal from "@/components/global/InitialCharacterSetupModal.vue";
import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

/****************************************
 * DECLARATIONS
 ****************************************/
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRouter();
const spaceId = String(route.currentRoute.value.params.id);
const spaceName = String(route.currentRoute.value.params.name);
const userId = authStore.user?.id;

const canvasLocalStorage = useStorage("atsumari_canvas", {
  lastUserPosition: { x: 0, y: 0 },
});

let users = reactive<Array<User>>([]);

// Request animation frame every ..ms (1000 / 30 = 30fps, 1000 / 45 = 45fps)

let canvasFrameRate = ref<number>(75);

let canvasLoaded = ref<boolean>(true);
// Need to change user speed based on canvasFrameRate
let speed =
  canvasFrameRate.value === 10
    ? 5
    : canvasFrameRate.value === 20
    ? 8
    : canvasFrameRate.value === 30
    ? 11
    : 10;

let initialUserPosition = {
  x: 100,
  y: 100,
};

let rightClickMenuIsEnabled = ref<boolean>(false);
let rightClickMenuPosition = ref<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

let rightClickWorldPosition = ref<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

let canvasZoom = ref<number>(1);

// Windows size to canvas size
let windowWidth = ref(window.innerWidth);
let windowHeight = ref(window.innerHeight);
window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
});

/****************************************
 * INITIALIZATION
 ****************************************/
onMounted(async () => {
  generalStore.spaceId = spaceId;
  generalStore.spaceName = spaceName;
  generalStore.userId = userId;
  generalStore.users = users;

  await handleReadProfile();

  // We need to do a lot of stuff in onMounted because we need to wait for the DOM to be ready because of canvas

  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;

  // Listen to canvasLoaded event
  emitter.on("canvasLoaded", () => {
    console.log("Canvas loaded");
    canvasLoaded.value = true;
  });

  // Change canvas size to window size dynamically
  watch(
    () => [windowWidth.value, windowHeight.value],
    ([width, height]) => {
      canvas.width = width;
      canvas.height = height - 10;
    },
    { immediate: true }
  );
  // Watch generalStore.rightSideMenuOpen and update canvas size accordingly
  watch(
    () => chatMenuOpen.value || onlineUsersMenuOpen.value,
    (newValue) => {
      if (newValue) {
        canvas.width = windowWidth.value - 380;
      } else {
        canvas.width = windowWidth.value;
      }
    },
    { immediate: true }
  );

  // Create canvas
  createCanvasApp(users, userId, speed, canvas, canvasFrameRate.value);

  // Listen to zoom events ctrl + mouse wheel
  canvas.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      console.log("Zooming");

      e.preventDefault();
      if (e.deltaY < 0) {
        canvasZoom.value += 0.1;
      } else {
        canvasZoom.value -= 0.1;
      }
      // Smooth zoom
      canvas.style.transition = "transform 0.1s ease-in-out";
      canvas.style.transform = `scale(${canvasZoom.value})`;
    }
  });

  // Focus canvas on click
  canvas.addEventListener("click", function () {
    canvas.focus();
  });

  // Listen to emit move events sent from canvas
  emitter.on("playerMove", async (myPlayer) => {
    users.forEach(async (user) => {
      if (user.id === userId) {
        user.x = myPlayer.x;
        user.y = myPlayer.y;
        user.facingTo = myPlayer.facingTo;
        user.isMoving = myPlayer.isMoving;

        // TODO: Use bitmap to send data
        await sendUserAction(user.x, user.y, user.facingTo, user.isMoving);
        // Save user position in localstorage
        canvasLocalStorage.value = {
          lastUserPosition: { x: user.x, y: user.y },
        };
        console.log("User move received,saved and updated");
      }
    });
  });

  // Listen to double click emit event sent from canvas
  /*   emitter.on("doubleClick", async (clickedPosition) => {
    console.log("Double click received", clickedPosition);

    // Update user position with the clicked position
    users.forEach(async (user) => {
      if (user.id === userId) {
        setTimeout(() => {
          user.x = clickedPosition.x;
          user.y = clickedPosition.y;
          user.facingTo = clickedPosition.facingTo;
          user.isMoving = clickedPosition.isMoving;
        }, 200);

        // Send user position in realtime
        await sendUserAction(user.x, user.y, user.facingTo, user.isMoving);

        // Save user position in localstorage
        canvasLocalStorage.value = {
          lastUserPosition: { x: user.x, y: user.y },
        };
        console.log("User move received,saved and updated");
      }
    });
  }); */

  // Listen to right click emit event sent from canvas
  emitter.on("rightClick", async (positions) => {
    console.log("Right click received", positions);

    // Update right click menu position
    rightClickMenuPosition.value = {
      x: positions.mousePos.mouseX,
      y: positions.mousePos.mouseY,
    };

    rightClickWorldPosition.value = {
      x: positions.worldPos.worldX,
      y: positions.worldPos.worldY,
    };

    // Enable right click menu
    rightClickMenuIsEnabled.value = true;
  });

  // Close right click menu on click
  canvas.addEventListener("click", () => {
    rightClickMenuIsEnabled.value = false;
  });
});

// Update user position with the clicked position
const moveUserToRightClickedPosition = async () => {
  users.forEach(async (user) => {
    if (user.id === userId) {
      // Update user position
      user.x = rightClickWorldPosition.value.x;
      user.y = rightClickWorldPosition.value.y;
      // Set to default
      user.facingTo = "down";
      user.isMoving = false;

      // Emit event to update canvas
      emitter.emit("rightClickPlayerMoveConfirmed", user);

      // Send user position in realtime
      await sendUserAction(user.x, user.y, user.facingTo, user.isMoving);

      // Save user position in localstorage
      canvasLocalStorage.value = {
        lastUserPosition: { x: user.x, y: user.y },
      };
      console.log("User move received,saved and updated");
    }
  });

  rightClickMenuIsEnabled.value = false;
};

// Initial setups
let initialSetupCompleted = ref<boolean>(true);
let userName = ref<string>("");
const handleReadProfile = async () => {
  try {
    let { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authStore?.session?.user?.id);
    if (profiles[0].user_name) {
      console.log("READ PROFILES: ", profiles);
      initialSetupCompleted.value = true;
      userName.value = profiles[0].user_name;
      generalStore.userName = userName.value;
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("READ PROFILES CATCH ERROR: ", error.message);
  }
};

const handleInitialSetupCompleted = async () => {
  initialSetupCompleted.value = true;
  await handleReadProfile();
};

/****************************************
 * REALTIME
 ****************************************/
const broadCastChannel = supabase.channel(spaceId, {
  config: {
    broadcast: {
      self: false, // Listen to your own broadcast events: https://supabase.com/docs/guides/realtime/broadcast#self-send-messages
      ack: false, // Acknowledge the event: https://supabase.com/docs/guides/realtime/broadcast#acknowledge-messages
    },
  },
});

if (initialSetupCompleted) {
}

broadCastChannel
  /*   .on('presence', { event: 'sync' }, () => {
    const state = broadCastChannel.presenceState()
    console.log('Channel synced: ', state)
  }) */
  .on("presence", { event: "join" }, async ({ key, newPresences }) => {
    // Listen to join event
    console.log("Someone joined the channel: ", newPresences[0].id);
    // Send start position for new user
    await sendUserAction(
      canvasLocalStorage.value.lastUserPosition
        ? canvasLocalStorage.value.lastUserPosition.x
        : initialUserPosition.x,
      canvasLocalStorage.value.lastUserPosition
        ? canvasLocalStorage.value.lastUserPosition.y
        : initialUserPosition.y,
      "down",
      false
    );

    // Add user to users array
    //if (newPresences[0].id !== userId) {
    users.push({
      userName: newPresences[0].userName,
      id: newPresences[0].id,
      x: newPresences[0].lastPosition.x,
      y: newPresences[0].lastPosition.y,
      facingTo: "down",
      isMoving: false,
    });
  })
  .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
    // Listen to leave event
    console.log("Someone left the channel: ", leftPresences);

    // Remove user from users array
    const userIndex = users.findIndex((user) => user.id === leftPresences[0].id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
    }
  })
  .subscribe(async (status: string) => {
    // Send join event
    if (status === "SUBSCRIBED") {
      const presenceTrackStatus = await broadCastChannel.track({
        id: authStore.user?.id,
        userName: userName.value,
        online_at: new Date().toISOString(),
        lastPosition: {
          x: canvasLocalStorage.value.lastUserPosition
            ? canvasLocalStorage.value.lastUserPosition.x
            : initialUserPosition.x,
          y: canvasLocalStorage.value.lastUserPosition
            ? canvasLocalStorage.value.lastUserPosition.y
            : initialUserPosition.y,
        },
      });
      console.log("Sent join event: ", presenceTrackStatus);
    }
  })
  .on("broadcast", { event: "sendUserPositionEvent" }, (payload: any) => {
    // Listen for broadcast events
    console.log("Received broadcast event", payload);

    // Update user position
    const user = users.find((user) => user.id === payload.payload.id);
    if (user) {
      user.x = payload.payload.x;
      user.y = payload.payload.y;
      user.facingTo = payload.payload.facingTo;
      user.isMoving = payload.payload.isMoving;
    }
  });

// Send user position
// TODO: add a tick rate so it doesn't send too many events
const sendUserAction = async (
  x: number,
  y: number,
  facingTo: string,
  isMoving: boolean
) => {
  broadCastChannel.send({
    type: "broadcast",
    event: "sendUserPositionEvent",
    payload: {
      id: authStore.user?.id,
      userName: userName.value,
      x: x,
      y: y,
      facingTo: facingTo,
      isMoving: isMoving,
    },
  });
  console.log("Sent broadcast event", { x, y, userName, facingTo, isMoving });
};

// Unsubscribe from channel when component is unmounted
onUnmounted(() => {
  broadCastChannel.unsubscribe();
});
/****************************************
 * end REALTIME
 ****************************************/

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

const handleOnlineUsersMenuOpen = () => {
  chatMenuOpen.value = false;
  onlineUsersMenuOpen.value = !onlineUsersMenuOpen.value;
};
const handleChatMenuOpen = () => {
  onlineUsersMenuOpen.value = false;
  chatMenuOpen.value = !chatMenuOpen.value;
};
</script>

<template>
  <!-- Loading animation to show until app mount -->
  <section v-if="!canvasLoaded" class="route-loading-overlay">
    <span class="loader"></span>
  </section>

  <div class="space">
    <div class="canvas-container">
      <!-- tabindex is there to be able to focus the canvas and listen to key events only on canvas-->
      <canvas id="main-canvas" class="canvas-container__canvas" tabindex="0"></canvas>

      <!-- Right-click   -->
      <button
        @click="moveUserToRightClickedPosition"
        v-show="rightClickMenuIsEnabled"
        class="btn canvas-container__right-click-menu"
        :style="{
          left: rightClickMenuPosition.x + 'px',
          top: rightClickMenuPosition.y + 'px',
        }"
        >{{ t("space.userActions.moveHere") }}</button
      >
    </div>

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
        <div class="left__media-sharing"></div>
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

    <InitialCharacterSetupModal
      v-if="!initialSetupCompleted"
      @initial-setup-completed="handleInitialSetupCompleted"
    />
  </div>
</template>

<style scoped lang="scss">
.space {
  background-color: #222;
  .canvas-container {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100vh;

    .canvas-container__canvas {
      image-rendering: pixelated;
      margin-left: 0;
      margin-top: 0;
    }

    .canvas-container__right-click-menu {
      position: absolute;
      z-index: 1000;
      background-color: var(--bg-300);
      color: #fff;
      outline: 2px solid var(--border);

      &:hover {
        background-color: var(--outline-btn-hover);
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
      .right__chat {
        .chat__chat-menu {
        }
      }
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
}
</style>
