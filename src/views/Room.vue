<script setup lang="ts">
// Need to import images or put them into public folder: https://stackoverflow.com/questions/59632839/how-to-use-canvas-with-vue-in-component
import WorldImage from '@/canvas/images/world1.png'
import CharacterDown from '@/canvas/images/char-down.png'

import { createCanvasApp } from '@/canvas/canvas'

// const { t } = useI18n()
const authStore = useAuthStore()
const route = useRouter()

let roomId = route.currentRoute.value.params.id
let roomName = route.currentRoute.value.params.name
let userId = authStore.user?.id

onMounted(async () => {
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
  createCanvasApp(users, canvas, WorldImage, CharacterDown)
})

// Windows size to canvas size
let windowWidth = ref(window.innerWidth)
let windowHeight = ref(window.innerHeight)
window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
})

let x = ref(0)
let y = ref(0)

// detect w a s d key events and increment +5
const handleKeyDown = async (event: { key: string }) => {
  // console.log('event: ', event)

  if (event.key === 'w') {
    y.value += -20
    // console.log('W pressed', y)
  } else if (event.key === 's') {
    y.value += 20
    // console.log('S pressed', y)
  } else if (event.key === 'a') {
    x.value += -20
    // console.log('A pressed', x)
  } else if (event.key === 'd') {
    x.value += 20
    // console.log('D pressed', x)
  }
  await sendUserAction(x.value, y.value)
}
window.addEventListener('keydown', handleKeyDown)

let users = reactive<Array<User>>([])

// Types for users array
interface User {
  id: string
  x: number
  y: number
  color: string
}

const userStartingPosition = reactive({
  x: 0,
  y: 0,
})

// REALTIME
const broadCastChannel = supabase.channel('test', {
  config: {
    broadcast: {
      self: true, // Listen to your own broadcast events: https://supabase.com/docs/guides/realtime/broadcast#self-send-messages
      ack: true, // Acknowledge the event: https://supabase.com/docs/guides/realtime/broadcast#acknowledge-messages
    },
  },
})

broadCastChannel
  /*   .on('presence', { event: 'sync' }, () => {
    const state = broadCastChannel.presenceState()
    console.log('Channel synced: ', state)
  }) */
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // Listen to join event
    console.log('Someone joined the channel: ', newPresences)

    // Add user to users array if not already there
    if (!users.find((user) => user.id === newPresences[0].id)) {
      users.push({
        id: newPresences[0].id,
        x: userStartingPosition.x,
        y: userStartingPosition.y,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      })
    }
  })
  .subscribe(async (status: string) => {
    // Send join event
    if (status === 'SUBSCRIBED') {
      const presenceTrackStatus = await broadCastChannel.track({
        id: authStore.user?.id,
        online_at: new Date().toISOString(),
      })
      console.log('Sent join event: ', presenceTrackStatus)

      await sendUserAction(userStartingPosition.x, userStartingPosition.y)
    }
  })
  .on('broadcast', { event: 'sendUserPositionEvent' }, (payload: any) => {
    // Listen for broadcast events
    console.log('Received broadcast event', payload)
    console.log('users at broadcast receive: ', users)

    // Update user position
    const user = users.find((user) => user.id === payload.payload.id)
    if (user) {
      user.x = payload.payload.x
      user.y = payload.payload.y
    }
  })

const sendUserAction = async (x: number, y: number) => {
  broadCastChannel.send({
    type: 'broadcast',
    event: 'sendUserPositionEvent',
    payload: {
      id: authStore.user?.id,
      x: x,
      y: y,
    },
  })
}

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
  <h1>{{ users }}</h1>
  <div class="room">
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

    transform: scale(3); // Scale canvas
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
