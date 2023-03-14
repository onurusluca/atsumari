<script setup lang="ts">
// Need to import images or put them into public folder: https://stackoverflow.com/questions/59632839/how-to-use-canvas-with-vue-in-component
import WorldImage from '@/canvas/images/world1.png'
import CharacterDown from '@/canvas/images/char-down.png'

import { Game } from '@/canvas/init'
//import '@/canvas/canvas'

const { t } = useI18n()
const authStore = useAuthStore()
const route = useRouter()

let roomId = route.currentRoute.value.params.id
let roomName = route.currentRoute.value.params.name
let userId = authStore.user?.id

let canvasWidth = ref(1024)
let canvasHeight = ref(768)

let users = reactive<any[]>([])

onMounted(async () => {
  await joinPresenceChannel()
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement

  new Game(canvas, canvasWidth.value, canvasHeight.value, WorldImage, players)
  console.log(users)
})

// Windows size to canvas size
let windowWidth = ref(window.innerWidth)
let windowHeight = ref(window.innerHeight)
window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
})

// Realtime
const channel = supabase.channel(roomId, {
  config: {
    broadcast: {
      self: true,
    },
  },
})
const BROADCAST_EVENT = 'cursor'

// Subscribe to mouse events.
// Our second parameter filters only for mouse events.
channel
  .on('broadcast', { event: BROADCAST_EVENT }, (event) => {
    receivedCursorPosition(event)
  })
  .subscribe()

// Handle a mouse event.
const receivedCursorPosition = ({ event, payload }) => {
  // Ignore our own events.
  //if (payload.id === authStore.user?.id) return

  // add to  users.value if the id is not already there and if it already exists, update x and y
  if (users.length > 0) {
    let found = false
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === payload.id) {
        found = true
        users[i].x = payload.x
        users[i].y = payload.y
        users[i].color = payload.color
      }
    }
    if (!found) {
      users.push(payload)
    }
  } else {
    users.push(payload)
  }
  console.log('JOIN USERS: ', users)
}

// Helper function for sending our own mouse position.
const sendPosition = (position: object) => {
  let x = position.offsetX
  let y = position.offsetY
  return channel.send({
    type: 'broadcast',
    event: BROADCAST_EVENT,
    payload: {
      id: authStore.user?.id,
      x,
      y,
      // unique color for each user
      color: '#' + Math.random().toString(16).substr(-6),
    },
  })
}

let x = 0
let y = 0

// detect w a s d key events and increment +5
const handleKeyDown = (event) => {
  if (event.key === 'w') {
    y += -20
  } else if (event.key === 's') {
    y += 20
  } else if (event.key === 'a') {
    x += -20
  } else if (event.key === 'd') {
    x += 20
  }

  //sendPosition({ offsetX: x, offsetY: y })
}

window.addEventListener('keydown', handleKeyDown)

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
  .on('presence', { event: 'sync' }, () => {
    const state = channelPresence.presenceState()
    users = state
    console.log('SYNC USERS: ', users)
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
  <div class="room">
    <code>
      {{ users }}
    </code>
    <router-link :to="{ name: 'Home' }"></router-link>

    <div v-for="(user, index) in users">
      <svg
        width="181"
        height="241"
        viewBox="0 0 18 24"
        fill="none"
        class="room__cursor"
        :style="`transform: translate(${user.x}px, ${user.y}px)`"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.717 2.22918L15.9831 15.8743C16.5994 16.5083 16.1503 17.5714 15.2661 17.5714H9.35976C8.59988 17.5714 7.86831 17.8598 7.3128 18.3783L2.68232 22.7C2.0431 23.2966 1 22.8434 1 21.969V2.92626C1 2.02855 2.09122 1.58553 2.717 2.22918Z"
          :fill="user.color"
          stroke="{hue}"
          strokeWidth="2"
        />
      </svg>
      <p>{{ user.uid }}</p></div
    >

    <div class="canvas-container">
      <canvas id="main-canvas" class="canvas-container__canvas"></canvas>
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
      border: 5px solid green;
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
