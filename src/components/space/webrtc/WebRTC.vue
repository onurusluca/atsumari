<script setup lang="ts">
import {
  HMSReactiveStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectPeers,
  selectIsConnectedToRoom,
  selectVideoTrackByID,
} from "@100mslive/hms-video-store";

import { EnvVariables } from "@/envVariables";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});

const LIVEKIT_API_KEY = EnvVariables.livekitApiKey;
const LIVEKIT_URL = EnvVariables.livekitUrl;

let roomCode = ref<string>("");
let userName = ref<string>("");

const peers = ref([]);
const audioEnabled = ref(true);
const videoEnabled = ref(true);

// Initialize HMS Store
const hmsManager = new HMSReactiveStore();
hmsManager.triggerOnSubscribe();
const hmsStore = hmsManager.getStore();
const hmsActions = hmsManager.getActions();

// Joining the room
const joinRoom = async () => {
  // use room code to fetch auth token
  const authToken = await hmsActions.getAuthTokenByRoomCode({
    roomCode: roomCode.value,
  });
  // join room using username and auth token
  hmsActions.join({
    userName: userName.value,
    authToken,
  });
};

// Leaving the room
const leaveRoom = async () => {
  await hmsActions.leave();
  peers.value = [];
};

// Cleanup if user refreshes the tab or navigates away
onBeforeUnmount(leaveRoom);

// Reactive state - update peers whenever there is a change in the peer-list
watchEffect(() => {
  const newPeers = hmsStore
    .getState(selectPeers)
    .filter((peer) => !peers.value.find((p) => p.id === peer.id));
  peers.value = [...peers.value, ...newPeers];
});

// Mute and unmute audio
const toggleAudio = () => {
  const newAudioEnabled = !audioEnabled.value;
  hmsActions.setLocalAudioEnabled(newAudioEnabled);
  audioEnabled.value = newAudioEnabled;
};

// Mute and unmute video
const toggleVideo = () => {
  const newVideoEnabled = !videoEnabled.value;
  hmsActions.setLocalVideoEnabled(newVideoEnabled);
  videoEnabled.value = newVideoEnabled;
};

// Showing the required elements on connection/disconnection
const onConnection = (isConnected: boolean) => {
  const form = document.getElementById("join");
  const conference = document.getElementById("conference");
  const leaveBtn = document.getElementById("leave-btn");
  const controls = document.getElementById("controls");

  if (isConnected) {
    form?.classList.add("hide");
    conference?.classList.remove("hide");
    leaveBtn?.classList.remove("hide");
    controls?.classList.remove("hide");
  } else {
    form?.classList.remove("hide");
    conference?.classList.add("hide");
    leaveBtn?.classList.add("hide");
    controls?.classList.add("hide");
  }
};

// Listen to the connection state
watchEffect(() => {
  onConnection(hmsStore.getState(selectIsConnectedToRoom));
});
</script>

<template>
  <div class="webrtc">
    <header>
      <img class="logo" src="https://www.100ms.live/assets/logo.svg" />
      <button id="leave-btn" class="btn-danger hide" @click="leaveRoom"
        >Leave Room</button
      >
    </header>
    <form id="join">
      <h2>Join Room</h2>
      <div class="input-container">
        <input v-model="userName" type="text" name="username" placeholder="Your name" />
      </div>
      <div class="input-container">
        <input v-model="roomCode" type="text" name="roomCode" placeholder="Room code" />
      </div>
      <button type="button" class="btn-primary" @click="joinRoom">Join</button>
    </form>

    <div id="conference" class="conference-section hide">
      <h2>Conference</h2>

      <div id="peers-container">
        <div v-for="peer in peers" :key="peer.id" class="peer-tile">
          <video
            class="peer-video"
            :id="'video-' + peer.id"
            autoplay
            muted
            playsinline
          ></video>
          <div class="peer-name">{{ peer.name }}</div>
        </div>
      </div>
    </div>

    <div id="controls" class="control-bar hide">
      <button id="mute-aud" class="btn-control" @click="toggleAudio">{{
        audioEnabled ? "Mute" : "Unmute"
      }}</button>
      <button id="mute-vid" class="btn-control" @click="toggleVideo">{{
        videoEnabled ? "Hide" : "Unhide"
      }}</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.webrtc {
}
</style>
