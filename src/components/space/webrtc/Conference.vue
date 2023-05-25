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

// Another room for the users that are close to each other
const myClosePerimeterRoomName = "my-close-perimeter-room";

let roomName = ref<string>("general-hall-room");
let isUserInARoom = ref<boolean>(false);
let userToken = ref<string>("");
let isCurrentlyConnected = ref<boolean>(false);

const wssUrl = ref("wss://atsumari.livekit.cloud");
const remoteVideoContainer = ref();
onMounted(() => {});

let isJoinedToARoom = ref<boolean>(false);
emitter.on(
  "playerInRoom",
  async (data: { isPlayerInARoom: boolean; roomName: string }) => {
    if (data.isPlayerInARoom === true && !isJoinedToARoom.value) {
      console.log("in room", data);

      isJoinedToARoom.value = true;
      isUserInARoom.value = true;
      roomName.value = data.roomName;

      await joinRoom();
      if (webRtcStore.devices.isMicrophoneEnabled) {
        room.localParticipant.setMicrophoneEnabled(true);
      }
    } else if (data.isPlayerInARoom === false && isJoinedToARoom.value) {
      isJoinedToARoom.value = false;
      isUserInARoom.value = false;
      roomName.value = "";

      leaveRoom();

      if (!webRtcStore.devices.isMicrophoneEnabled) {
        room.localParticipant.setMicrophoneEnabled(false);
      }

      console.log("outside of room", data);
    }
  }
);

const room = new Room({
  audioCaptureDefaults: {
    autoGainControl: true,
    deviceId: "",
    echoCancellation: true,
    noiseSuppression: true,
  },
  videoCaptureDefaults: {
    deviceId: "",
    facingMode: "user",
    resolution: {
      width: 1280,
      height: 720,
      frameRate: 30,
    },
  },
  publishDefaults: {
    videoEncoding: {
      maxBitrate: 1_500_000,
      maxFramerate: 30,
    },
    screenShareEncoding: {
      maxBitrate: 1_500_000,
      maxFramerate: 30,
    },
    audioBitrate: 20_000,
    dtx: true,
    // only needed if overriding defaults
    /*     videoSimulcastLayers: [
      {
        width: 640,
        height: 360,
        encoding: {
          maxBitrate: 500_000,
          maxFramerate: 20,
        },
        resolution: {
          width: 640,
          height: 360,
        },
      },
      {
        width: 320,
        height: 180,
        encoding: {
          maxBitrate: 150_000,
          maxFramerate: 15,
        },
        resolution: {
          width: 640,
          height: 360,
        },
      },
    ], */
  },
});

const createToken = async (): Promise<string> => {
  try {
    const createdToken = (await createAccessToken(
      roomName.value,
      generalStore.userName
    )) as string;

    if (createdToken.includes("error")) {
      console.log("Failed to create token.", createdToken);
      throw new Error("Failed to create token: " + createdToken);
    } else {
      console.log("CREATED TOKEN", createdToken);
      return createdToken as string;
    }
  } catch (error) {
    console.log("Catch. Failed to create token.", error);
    throw error;
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
    // Style the video
    // TODO: For some reason, I have to style the video here. I can't style it in the template.
    track.style.width = "30vw";
    track.style.height = "20vh";
    track.style.objectFit = "cover";
    track.style.borderRadius = "1rem";
    track.style.border = "2px solid #fff";
    track.style.boxShadow = "0 0 1rem #000";

    remoteVideoContainer.value.appendChild(track);
    console.log("TRACK: ", track);
  });

  // Unsubscribe remote video and remove it
  room.on(RoomEvent.TrackUnsubscribed, function (remoteTrack) {
    const track = remoteTrack.detach();
    remoteVideoContainer.value.removeChild(track);
  });

  // Connect to room
  try {
    await room.connect(wssUrl.value, userToken.value);
    isCurrentlyConnected.value = true;
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
  userToken.value = await createToken();

  if (userToken.value) {
    console.log(userToken.value);

    await prepareForConnection();
  }
};

const leaveRoom = () => {
  room.disconnect();
  isCurrentlyConnected.value = false;
};

// WATCHERS
let isMicEnabled = ref<boolean>(false);
let isCameraEnabled = ref<boolean>(false);
let isScreenShareEnabled = ref<boolean>(false);

watch(
  () => webRtcStore.devices.isMicrophoneEnabled,
  (newValue) => {
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
  (newValue) => {
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
  (newValue) => {
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
    <div class="conference__video" ref="remoteVideoContainer"></div>
  </div>
</template>

<style scoped lang="scss">
.conference {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__video {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    border: 4px solid blueviolet;
  }
}
</style>
