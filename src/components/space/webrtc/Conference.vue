<script setup lang="ts">
import { createAccessToken } from "@/composables/useWebrtc";
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
const roomName = ref<string>("general-hall-room");
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
  try {
    const createdToken = (await createAccessToken(
      roomName.value,
      generalStore.userName
    )) as string;

    if (createdToken.includes("error")) {
      console.log("Failed to create token.", createdToken);
    } else {
      const expiryTime = new Date(
        new Date().getTime() + 23 * 60 * 60 * 1000
      ).toISOString();

      console.log("CREATED TOKEN", createdToken);

      // Save token to local storage
      // Set the expiry of the auth token to 23 hours from now
      webrtcLocalStorage.value = {
        userAuthToken: createdToken,
        userAuthTokenExpiry: expiryTime,
      };

      return createdToken;
    }
  } catch (error) {
    console.log("Catch. Failed to create token.", error);
  }
};

const prepareForConnection = async () => {
  try {
    await room.prepareConnection(wssUrl.value);
  } catch (error) {
    console.log("Failed to prepare connection.", error);
  }

  // Subscribe remote video and display it
  room.on(RoomEvent.TrackSubscribed, function (remoteTrack) {
    const track = remoteTrack.attach();
    // style the video
    track.style.width = "90vw";
    track.style.height = "70vh";
    track.style.objectFit = "cover";
    track.style.borderRadius = "1rem";
    track.style.border = "2px solid #fff";
    track.style.boxShadow = "0 0 1rem #000";

    remoteVideoContainer.value.appendChild(track);
    console.log("TRACK: ", track);
  });

  // Connect to room
  try {
    await room.connect(wssUrl.value, userToken.value);
    console.log("Connected to room.");
  } catch (error) {
    console.log("Failed to connect to room.", error);

    // If token is invalid, create a new token and try again
    createToken().then(async (token: string) => {
      userToken.value = token;
      await joinRoom();
    });
  }

  // Enable camera and microphone
  // await room.localParticipant.setMicrophoneEnabled(true);
  // webRtcStore.devices.isMicrophoneEnabled = true;
};

const joinRoom = async () => {
  if (isLocalStorageTokenInvalid()) {
    console.log("Either no token or token expired. Creating new token.");
    userToken.value = await createToken();
    console.log(
      userToken.value ? "Token created successfully" : "Failed to create token."
    );
  } else {
    console.log("Token exists and is valid. Joining room.");
    userToken.value = webrtcLocalStorage.value.userAuthToken;
  }

  if (userToken.value) {
    console.log(userToken.value);

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
    <div class="conference__video" ref="remoteVideoContainer">remote</div>

    <button @click="createToken" class="btn btn-outline">CREATE TOKEN</button>
    <button @click="joinRoom" class="btn btn-save">JOIN ROOM</button>
    <button @click="leaveRoom" class="btn btn-danger">LEAVE ROOM</button>
  </div>
</template>

<style scoped lang="scss">
.conference {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__video {
    width: 20rem;
    height: 20rem;
    background-color: black;
    border: 4px solid blueviolet;
  }
}
</style>
