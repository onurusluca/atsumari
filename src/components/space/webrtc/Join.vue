<script setup lang="ts">
import { createAccessToken, listRooms, createRoom } from "@/composables/useWebrtc";
import { Room, RoomEvent, Participant } from "livekit-client";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const webRtcStore = useWebRtcStore();
const route = useRouter();
const webrtcLocalStorage = useStorage("atsumari_webrtc", {
  userAuthToken: "",
  userAuthTokenExpiry: "",
});

let wssUrl = ref("wss://atsumari.livekit.cloud");
let roomName = ref<string>("new-room");

onMounted(() => {});

let isUserInARoom = ref<boolean>(false);
emitter.on("playerInRoom", (data: any) => {
  console.log("Received playerInRoom event");

  if (data.inRoom === true && !isUserInARoom.value) {
    console.log("joining room");
    roomName.value = data.roomName;
    isUserInARoom.value = true;
  } else if (data.inRoom === false && isUserInARoom.value) {
    console.log("leaving room");
    isUserInARoom.value = false;
  }
});

const room = new Room();
const userToken = ref<string>("");
const remoteVideoContainer = ref();

const createAuthToken = async () => {
  let createdToken = (await createAccessToken(
    roomName.value,
    generalStore.userName
  )) as string;

  // Save token to local storage
  webrtcLocalStorage.value.userAuthToken = createdToken;
  // Set the expiry of the auth token to 23 hours from now
  webrtcLocalStorage.value.userAuthTokenExpiry = new Date(
    new Date().getTime() + 23 * 60 * 60 * 1000
  ).toISOString(); // 23 hours from creation

  return createdToken;
};

const prepareForConnection = async () => {
  await room.prepareConnection(wssUrl.value);

  // Subscribe remote video and display it to remoteVideoContainer
  room.on(RoomEvent.TrackSubscribed, function (remoteTrack) {
    const track = remoteTrack.attach();
    remoteVideoContainer.value.appendChild(track);
  });

  // Connect to room
  await room.connect(wssUrl.value, userToken.value);

  // Enable camera and microphone
  await room.localParticipant.setMicrophoneEnabled(true);
  webRtcStore.devices.isMicrophoneEnabled = true;
};

const validateToken = async () => {};

const joinRoom = async () => {
  if (
    !webrtcLocalStorage.value.userAuthToken ||
    webrtcLocalStorage.value.userAuthToken === "" ||
    new Date(webrtcLocalStorage.value.userAuthTokenExpiry) < new Date()
  ) {
    console.log("Either no token or token expired. Creating new token.");

    userToken.value = await createAuthToken();

    if (userToken.value !== "") {
      console.log("Token created successfully. Joining room.");

      await prepareForConnection();
    }
  } else {
    console.log("Token exists and is valid. Joining room.");

    userToken.value = webrtcLocalStorage.value.userAuthToken;
    await prepareForConnection();
  }
};

// WATCHERS
let isMicEnabled = ref<boolean>(false);
let isCameraEnabled = ref<boolean>(false);
let isScreenShareEnabled = ref<boolean>(false);

watch(
  () => webRtcStore.devices.isMicrophoneEnabled,
  (newValue, oldValue) => {
    console.log("isMicrophoneEnabled changed");
    isMicEnabled.value = newValue;

    if (isMicEnabled.value) {
      room.localParticipant.setMicrophoneEnabled(true);
    } else {
      room.localParticipant.setMicrophoneEnabled(false);
    }
  },
  { immediate: true }
);

watch(
  () => webRtcStore.devices.isCameraEnabled,
  (newValue, oldValue) => {
    console.log("isCameraEnabled changed");
    isCameraEnabled.value = newValue;

    if (isCameraEnabled.value) {
      joinRoom();
      room.localParticipant.setCameraEnabled(true);
    } else {
      room.localParticipant.setCameraEnabled(false);
    }
  },
  { immediate: true }
);

watch(
  () => webRtcStore.devices.isScreenSharing,
  (newValue, oldValue) => {
    console.log("isScreenSharing changed");
    isScreenShareEnabled.value = newValue;

    if (isScreenShareEnabled.value) {
      room.localParticipant.setScreenShareEnabled(true);
    } else {
      room.localParticipant.setScreenShareEnabled(false);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="conference">
    <h1>Conference</h1>
    <div class="join__video" ref="remoteVideoContainer">remote</div>

    <button @click="joinRoom" class="btn btn-save">JOIN ROOM</button>
  </div>
</template>

<style scoped lang="scss">
.conference {
}
</style>
