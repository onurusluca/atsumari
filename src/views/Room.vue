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

/******************
 * INITIALIZATION
 ******************/
onMounted(async () => {
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;

  createCanvasApp(userId, users, canvas, WorldImage, CharacterDown);

  // Focus canvas on click
  canvas.addEventListener("click", function () {
    canvas.focus();
  });

  // Listen to events sent from canvas
  emitter.on("playerMove", (data) => {
    console.log("EMITRECEIVED", data);
  });
});

let x = ref(0);
let y = ref(0);
const speed = 35;
let initialUserPosition = {
  x: 0,
  y: 0,
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

    // Add user to users array except self
    if (newPresences[0].id !== userId) {
      users.push({
        id: newPresences[0].id,
        x: 0,
        y: 0,
      });
    }

    // Send start position
    await sendUserAction(initialUserPosition.x, initialUserPosition.y);
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.room {
  .canvas-container {
    /*     position: absolute;
    overflow: hidden;
    pointer-events: none;
    transform-origin: left top 0px;
 */
    .canvas-container__canvas {
      image-rendering: pixelated;
      margin-left: 0;
      margin-top: 0;
      border: 2px solid red;

      transform: scale(1);
    }
  }
}
</style>
