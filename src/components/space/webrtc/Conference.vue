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

const wssUrl = ref("wss://atsumari.livekit.cloud");
const roomName = ref<string>("new-room");
const isUserInARoom = ref<boolean>(false);
const userToken = ref<string>("");
const remoteVideoContainer = ref();

onMounted(() => {
  emitter.on("playerInRoom", handlePlayerInRoom);
});

const handlePlayerInRoom = (data: any) => {
  const status = data ? "joining room" : "leaving room";
  console.log(status);
  isUserInARoom.value = data;
};

const room = new Room();

const createToken = async (): Promise<string> => {
  const createdToken = (await createAccessToken(
    roomName.value,
    generalStore.userName
  )) as string;
  const expiryTime = new Date(new Date().getTime() + 23 * 60 * 60 * 1000).toISOString();

  // Save token to local storage
  // Set the expiry of the auth token to 23 hours from now
  webrtcLocalStorage.value = {
    userAuthToken: createdToken,
    userAuthTokenExpiry: expiryTime,
  };

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
  try {
    await room.connect(wssUrl.value, userToken.value);
  } catch (error) {
    console.log("Failed to connect to room.", error);

    // TODO: don't know which error is thrown when token is invalid
    // If token is invalid, create a new token and try again
    createToken().then(async () => {
      await joinRoom();
    });
  }

  // Enable camera and microphone
  await room.localParticipant.setMicrophoneEnabled(true);
  webRtcStore.devices.isMicrophoneEnabled = true;
};

const joinRoom = async () => {
  if (isLocalStorageTokenInvalid()) {
    console.log("Either no token or token expired. Creating new token.");
    userToken.value = await createToken();
    console.log(
      userToken.value
        ? "Token created successfully. Joining room."
        : "Failed to create token."
    );
  } else {
    console.log("Token exists and is valid. Joining room.");
    userToken.value = webrtcLocalStorage.value.userAuthToken;
  }

  if (userToken.value) {
    await prepareForConnection();
  }
};

const isLocalStorageTokenInvalid = (): boolean => {
  return (
    !webrtcLocalStorage.value.userAuthToken ||
    webrtcLocalStorage.value.userAuthToken === "" ||
    new Date(webrtcLocalStorage.value.userAuthTokenExpiry) < new Date()
  );
};

const leaveRoom = () => {
  room.disconnect();
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
    <button @click="leaveRoom" class="btn btn-danger">LEAVE ROOM</button>
  </div>
</template>

<style scoped lang="scss">
.conference {
}
</style>
