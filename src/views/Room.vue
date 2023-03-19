<script setup lang="ts">
/******************
 * IMPORTS
 ******************/
// Need to import images or put them into public folder: https://stackoverflow.com/questions/59632839/how-to-use-canvas-with-vue-in-component
import WorldImage from "@/canvas/images/world-image.png";
import CharacterDown from "@/canvas/images/char-down.png";

import { createCanvasApp } from "@/canvas/canvas";
import { emitter } from "@/composables/useEmit";

import type { User } from "@/types/general";

/******************
 * DECLARATIONS
 ******************/
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

let roomId = route.currentRoute.value.params.id;
let roomName = route.currentRoute.value.params.name;
let userId = authStore.user?.id;

const canvasLocalStorage = useStorage("atsumari_canvas", {
  lastUserPosition: { x: 0, y: 0 },
});
let users = reactive<Array<User>>([]);

let rightClickMenuIsEnabled = ref<boolean>(false);
let rightClickMenuPosition = ref<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

let rightClickWorldPosition = ref<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

/******************
 * INITIALIZATION
 ******************/

// Windows size to canvas size
let windowWidth = ref(window.innerWidth);
let windowHeight = ref(window.innerHeight);
window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
});

onMounted(async () => {
  // We need to do a lot of stuff in onMounted because we need to wait for the DOM to be ready because of canvas

  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;

  // Change canvas size to window size dynamically
  watch(
    () => [windowWidth.value, windowHeight.value],
    ([width, height]) => {
      canvas.width = width;
      canvas.height = height;
    },
    { immediate: true }
  );

  // Create canvas
  createCanvasApp(userId, users, canvas, WorldImage, CharacterDown);

  // Focus canvas on click
  canvas.addEventListener("click", function () {
    canvas.focus();
  });

  // Listen to emit events sent from canvas
  emitter.on("playerMove", async (inputs) => {
    users.forEach(async (user) => {
      if (user.id === userId) {
        if (inputs.w) {
          user.y -= speed;
        } else if (inputs.s) {
          user.y += speed;
        } else if (inputs.a) {
          user.x -= speed;
        } else if (inputs.d) {
          user.x += speed;
        }

        // Send data 1 second after user stopped moving
        if (!inputs.w && !inputs.s && !inputs.a && !inputs.d) {
          // Send user position in realtime
          // TODO: Use bitmap to send data for performance

          await sendUserAction(user.x, user.y);

          // Save user position in localstorage
          canvasLocalStorage.value = {
            lastUserPosition: { x: user.x, y: user.y },
          };
          console.log("User move received,saved and updated");
        }
      }
    });
  });

  // Listen to double click emit event sent from canvas
  emitter.on("doubleClick", async (clickedPosition) => {
    console.log("Double click received", clickedPosition);

    // Update user position with the clicked position
    users.forEach(async (user) => {
      if (user.id === userId) {
        user.x = clickedPosition.x;
        user.y = clickedPosition.y;

        // Send user position in realtime
        await sendUserAction(user.x, user.y);

        // Save user position in localstorage
        canvasLocalStorage.value = {
          lastUserPosition: { x: user.x, y: user.y },
        };
        console.log("User move received,saved and updated");
      }
    });
  });

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

const moveUserToRightClickedPosition = async () => {
  // Update user position with the clicked position
  users.forEach(async (user) => {
    if (user.id === userId) {
      user.x = rightClickWorldPosition.value.x;
      user.y = rightClickWorldPosition.value.y;

      // Send user position in realtime
      await sendUserAction(user.x, user.y);

      // Save user position in localstorage
      canvasLocalStorage.value = {
        lastUserPosition: { x: user.x, y: user.y },
      };
      console.log("User move received,saved and updated");
    }
  });

  rightClickMenuIsEnabled.value = false;
};

let speed = 20;
let initialUserPosition = {
  x: 100,
  y: 100,
};

/******************
 * REALTIME
 ******************/
const broadCastChannel = supabase.channel(roomId, {
  config: {
    broadcast: {
      self: false, // Listen to your own broadcast events: https://supabase.com/docs/guides/realtime/broadcast#self-send-messages
      ack: true, // Acknowledge the event: https://supabase.com/docs/guides/realtime/broadcast#acknowledge-messages
    },
  },
});

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
        : initialUserPosition.y
    );

    // Add user to users array except self
    //if (newPresences[0].id !== userId) {
    users.push({
      id: newPresences[0].id,
      x: newPresences[0].lastPosition.x,
      y: newPresences[0].lastPosition.y,
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
    }
  });

// Send user position
// TODO: add a tick rate so it doesn't send too many events
const sendUserAction = async (x: number, y: number) => {
  broadCastChannel.send({
    type: "broadcast",
    event: "sendUserPositionEvent",
    payload: {
      id: authStore.user?.id,
      x: x,
      y: y,
    },
  });
  console.log("Sent broadcast event", { x, y });
};

/******************
 * -end REALTIME
 ******************/
</script>

<template>
  <div class="room">
    <div class="canvas-container">
      <!-- tabindex is there to be able to focus the canvas and listen to key events only on canvas-->
      <canvas id="main-canvas" class="canvas-container__canvas" tabindex="0"></canvas>

      <!-- Right-click menu  -->
      <div
        v-show="rightClickMenuIsEnabled"
        class="canvas-container__right-click-menu"
        :style="{
          left: rightClickMenuPosition.x + 'px',
          top: rightClickMenuPosition.y + 'px',
        }"
      >
        <div @click="moveUserToRightClickedPosition" class="right-click-menu__item"
          >Move here</div
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.room {
  background-color: #222;
  .canvas-container {
    .canvas-container__canvas {
      image-rendering: pixelated;
      margin-left: 0;
      margin-top: 0;
    }

    .canvas-container__right-click-menu {
      position: absolute;
      background-color: #fff;
      border: 1px solid #000;
      border-radius: 5px;
      padding: 5px;
      z-index: 1000;

      .right-click-menu__item {
        padding: 5px;
        cursor: pointer;
        &:hover {
          background-color: #000;
          color: #fff;
        }
      }
    }
  }
}
</style>
