<script setup lang="ts">
// Need to import images or put them into public folder: https://stackoverflow.com/questions/59632839/how-to-use-canvas-with-vue-in-component
import WorldImage from "@/canvas/images/world-image.png";
import CharacterDown from "@/canvas/images/char-down.png";

import { createCanvasApp } from "@/canvas/canvas";

// const { t } = useI18n()
const authStore = useAuthStore();
const route = useRouter();

let roomId = route.currentRoute.value.params.id;
let roomName = route.currentRoute.value.params.name;
let userId = authStore.user?.id;

onMounted(async () => {
  const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
  createCanvasApp(userId, users, canvas, WorldImage, CharacterDown);

  canvas.addEventListener("keydown", function (event) {
    if (event.target === canvas) {
      // Handle keydown event
      handleKeyDown(event);
    }
  });

  // Focus canvas on click
  canvas.addEventListener("click", function () {
    canvas.focus();
  });
});

// Windows size to canvas size
let windowWidth = ref(window.innerWidth);
let windowHeight = ref(window.innerHeight);
window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
});

let x = ref(0);
let y = ref(0);
const speed = 35;

// detect w a s d key events and increment x and y
const handleKeyDown = async (event: { key: string }) => {
  let lastKey = "";
  let pressedKey = "";

  if (event.key === "w") {
    lastKey = "w";
    pressedKey = "w";
  } else if (event.key === "s") {
    lastKey = "s";
    pressedKey = "s";

    await sendUserAction(x.value, y.value);
  } else if (event.key === "a") {
    lastKey = "a";
    pressedKey = "a";
  } else if (event.key === "d") {
    lastKey = "d";
    pressedKey = "d";
  }

  if (pressedKey === "w" && lastKey === "w") {
    y.value -= speed;
    lastKey = "w";
    await sendUserAction(x.value, y.value);
  } else if (pressedKey === "s" && lastKey === "s") {
    lastKey = "s";
    y.value += speed;
    await sendUserAction(x.value, y.value);
  } else if (pressedKey === "a" && lastKey === "a") {
    lastKey = "a";
    x.value -= speed;
    await sendUserAction(x.value, y.value);
  } else if (pressedKey === "d" && lastKey === "d") {
    lastKey = "d";
    x.value += speed;
    await sendUserAction(x.value, y.value);
  }
};

let users = reactive<Array<User>>([]);

// Types for users array
interface User {
  id: string;
  x: number;
  y: number;
  color: string;
}

// REALTIME
const broadCastChannel = supabase.channel("test", {
  config: {
    broadcast: {
      self: true, // Listen to your own broadcast events: https://supabase.com/docs/guides/realtime/broadcast#self-send-messages
      ack: true, // Acknowledge the event: https://supabase.com/docs/guides/realtime/broadcast#acknowledge-messages
    },
  },
});

broadCastChannel
  /*   .on('presence', { event: 'sync' }, () => {
    const state = broadCastChannel.presenceState()
    console.log('Channel synced: ', state)
  }) */
  .on("presence", { event: "join" }, ({ key, newPresences }) => {
    // Listen to join event
    console.log("Someone joined the channel: ", newPresences);

    // Add user to users array if not already there except self
    /* if (
      !users.find((user) => user.id === newPresences[0].id) &&
      newPresences[0].id !== authStore.user?.id
    ) { */
    users.push({
      id: newPresences[0].id,
      x: x.value,
      y: y.value,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
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
      });
      console.log("Sent join event: ", presenceTrackStatus);

      await sendUserAction(x.value, y.value);
    }
  })
  .on("broadcast", { event: "sendUserPositionEvent" }, (payload: any) => {
    // Listen for broadcast events
    console.log("Received broadcast event", payload);
    console.log("users at broadcast receive: ", users);

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

// Listen for presence events
/* channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log(state)
}) */

// Send a presence event
/* channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    const presenceTrackStatus = await channel.track({
      id: authStore.user?.id,
      online_at: new Date().toISOString(),
    })
    console.log(presenceTrackStatus)
  }
}) */
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
