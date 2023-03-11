<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const route = useRouter()

let roomId = route.currentRoute.value.params.id
let roomName = route.currentRoute.value.params.name
let userId = authStore.user?.id
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  joinPresenceChannel()
  initCanvas()

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
})

// Windows size to canvas size
let windowWidth = ref(window.innerWidth)
let windowHeight = ref(window.innerHeight)

window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
})

let rectX = ref(0)
let rectY = ref(0)

const initCanvas = () => {
  const image = new Image()
  if (canvasRef.value) {
    // Set canvas size
    canvasRef.value.width = windowWidth.value - 30
    canvasRef.value.height = windowHeight.value - 30

    ctx = canvasRef.value.getContext('2d')

    // Draw image
    ctx?.fillRect(rectX.value, rectY.value, 100, 100)
  }
}

// watch for wasd key presses
const onKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'w':
      console.log('w')
      break
    case 'a':
      console.log('a')
      break
    case 's':
      console.log('s')
      break
    case 'd':
      console.log('d')
      break
    default:
      break
  }
}
const onKeyUp = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'w':
      console.log('w')
      break
    case 'a':
      console.log('a')
      break
    case 's':
      console.log('s')
      break
    case 'd':
      console.log('d')
      break
    default:
      break
  }
}

const onMouseDown = (event: MouseEvent) => {}
const onMouseUp = (event: MouseEvent) => {}

// Realtime
let users = ref([])
const channel = supabase.channel(roomId, {
  config: {
    broadcast: {
      // self: true,
    },
  },
})
const BROADCAST_EVENT = 'cursor'

// Subscribe to mouse events.
// Our second parameter filters only for mouse events.
channel
  .on('broadcast', { event: BROADCAST_EVENT }, (event) => {
    //console.log('Received event', event)

    receivedCursorPosition(event)
  })
  .subscribe()

// Handle a mouse event.
let colorCursor = ref('red')
const receivedCursorPosition = ({ event, payload }) => {
  // Ignore our own events.
  if (payload.userId === userId) return
  // set different cursor for every user
  rectX.value = payload.x
  rectY.value = payload.y
  colorCursor.value = payload.color
}

// Helper function for sending our own mouse position.
const sendMousePosition = (event) => {
  let x = event.offsetX
  let y = event.offsetY
  setTimeout(() => {
    return channel.send({
      type: 'broadcast',
      event: BROADCAST_EVENT,
      payload: {
        userId,
        x,
        y,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      },
    })
  }, 200)
}

// presence
const channelPresence = supabase.channel(roomId + 'PRESENCE', {
  config: {
    broadcast: {
      // self: true,
    },
    presence: { key: userId },
  },
})
channelPresence
  .on('presence', { event: 'sync' }, ({ key, newPresences }) => {
    console.log('SYNC', key, newPresences)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('JOIN', key, newPresences)
    if (newPresences.user === userId) return

    users.value.push(newPresences)
    console.log(users.value)
  })
  .subscribe()

const joinPresenceChannel = async (event) => {
  return await channelPresence.track({
    user: userId,
    online_at: new Date().toISOString(),
  })
}
</script>

<template>
  <div class="room" @mousemove="sendMousePosition">
    <router-link :to="{ name: 'Home' }"></router-link>
    <h3
      class="room__cursor"
      :style="`transform: translate(${rectX}px, ${rectY}px); color: ${colorCursor};`"
      >💩</h3
    >
    <div v-for="(user, index) in users">
      <svg
        :key="index"
        width="181"
        height="241"
        viewBox="0 0 18 24"
        fill="none"
        class="room__cursor"
        :style="`transform: translate(${rectX}px, ${rectY}px)`"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.717 2.22918L15.9831 15.8743C16.5994 16.5083 16.1503 17.5714 15.2661 17.5714H9.35976C8.59988 17.5714 7.86831 17.8598 7.3128 18.3783L2.68232 22.7C2.0431 23.2966 1 22.8434 1 21.969V2.92626C1 2.02855 2.09122 1.58553 2.717 2.22918Z"
          :fill="colorCursor"
          stroke="{hue}"
          strokeWidth="2"
        /></svg
    ></div>

    <div class="canvas-container">
      <!--  <canvas
        ref="canvasRef"
        class="canvas-container__canvas"
      ></canvas> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.room {
  height: 100vh;
  width: 100vw;

  display: flex;
  align-items: center;
  justify-content: center;
  .canvas-container {
    position: relative;

    transform: scale(1); // Scale canvas
    .canvas-container__canvas {
      image-rendering: pixelated;
      border: 5px solid red;
    }
  }

  .room__cursor {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    font-size: 5rem;
    height: 4rem;
    width: 4rem;
    transition: transform 0.1s ease-in-out;
  }
}
</style>
