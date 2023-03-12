<script setup lang="ts">
// Need to import images or put them into public folder: https://stackoverflow.com/questions/59632839/how-to-use-canvas-with-vue-in-component
import WorldImage from '@/canvas/images/world1.png'
import CharacterDown from '@/canvas/images/char-down.png'

const { t } = useI18n()
const authStore = useAuthStore()
const route = useRouter()

let roomId = route.currentRoute.value.params.id
let roomName = route.currentRoute.value.params.name
let userId = authStore.user?.id

const canvasRef = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null
let canvasWidth = ref(1024)
let canvasHeight = ref(768)

onMounted(() => {
  joinPresenceChannel()

  if (canvasRef.value) {
    ctx = canvasRef.value?.getContext('2d') ?? null

    canvasRef.value.width = canvasWidth.value
    canvasRef.value.height = canvasHeight.value
    ctx = canvasRef.value.getContext('2d')
  }

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

const worldImage = new Image()
worldImage.src = WorldImage

const playerImage = new Image()
playerImage.src = CharacterDown

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
}

let i = 0
let fps = 1
const animate = () => {
  setTimeout(function () {
    requestAnimationFrame(animate)

    // ... Code for Drawing the Frame ...
  }, 1000 / fps)
  // World
  ctx.drawImage(worldImage, -300, -300)
  // Chracter
  ctx.drawImage(
    playerImage,
    0,
    0,
    playerImage.width / 4,
    playerImage.height,
    canvasHeight.value / 5,
    canvasWidth.value / 2.5,
    playerImage.width / 4,
    playerImage.height
  )

  if (keys.w.pressed) {
    ctx.drawImage(worldImage, -300, -280)
  }

  // console log increment +1  every time animate is called
  i++
  console.log('animate')
}
setTimeout(() => {
  animate()
}, 1000)
// watch for wasd key presses
const onKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'w':
      keys.w.pressed = true
      break
    case 'a':
      keys.a.pressed = true
      break
    case 's':
      keys.s.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
    default:
      break
  }
}
const onKeyUp = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
    default:
      break
  }
}

const onMouseDown = (event: MouseEvent) => {}
const onMouseUp = (event: MouseEvent) => {}

// Realtime
const channel = supabase.channel(roomId, {
  config: {
    broadcast: {
      //self: true,
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
let users = reactive<any[]>([])
const receivedCursorPosition = ({ event, payload }) => {
  // Ignore our own events.
  if (payload.userEmail === authStore.user?.email) return

  // add to  users.value if the userEmail is not already there and if it already exists, update x and y
  if (users.length > 0) {
    let found = false
    for (let i = 0; i < users.length; i++) {
      if (users[i].userEmail === payload.userEmail) {
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
        userEmail: authStore.user?.email,
        x,
        y,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      },
    })
  }, 200)
}

// presence
const channelPresence = supabase.channel(roomId + '2PRESENCE', {
  config: {
    broadcast: {
      // self: true,
    },
    presence: { key: userId },
  },
})
channelPresence
  .on('presence', { event: 'sync' }, ({ key, newPresences }) => {
    const state = channelPresence.presenceState()
    users.value = state
    console.log(users.value)
  })
  /*   .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('JOIN', key, newPresences)
  }) */
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
    <!-- <div v-for="(user, index) in users">
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
      <p>{{ user.uuserEmail }}</p></div> -->

    <div class="canvas-container">
      <canvas ref="canvasRef" class="canvas-container__canvas"></canvas>
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
