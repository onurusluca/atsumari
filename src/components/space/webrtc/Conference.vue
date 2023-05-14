<script setup lang="ts">
import { EnvVariables } from "@/envVariables";
import { createAccessToken, listRooms, createRoom } from "@/composables/useWebrtc";
import { Room, RoomEvent, Participant } from "livekit-client";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

let wssUrl = ref("wss://atsumari.livekit.cloud");
let roomName = ref<string>("new-room");

onMounted(() => {});

const room = new Room();
const userToken = ref<string>("");
const remoteVideoContainer = ref();

const createAuthToken = async () => {
  return await createAccessToken(roomName.value, generalStore.userName);
};

const joinRoom = async () => {
  await room.prepareConnection(wssUrl.value);

  // Subscribe remote video and display it to remoteVideoContainer
  room.on(RoomEvent.TrackSubscribed, function (remoteTrack) {
    const track = remoteTrack.attach();
    remoteVideoContainer.value.appendChild(track);
  });

  // Connect to room
  await room.connect(wssUrl.value, userToken.value);

  // Enable camera and microphone
  await room.localParticipant.enableCameraAndMicrophone();
};

const shareScreen = async () => {
  await room.localParticipant.setScreenShareEnabled(true);
};
</script>

<template>
  <div class="conference">
    <h1>Conference</h1>
  </div>
</template>

<style scoped lang="scss">
.conference {
}
</style>
