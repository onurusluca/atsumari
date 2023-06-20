<script setup lang="ts">
import { createAccessToken } from "@/composables/useWebrtc";
import { Room, RoomEvent, Participant } from "livekit-client";
import EnvVariables from "@/envVariables";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const webRtcStore = useWebRtcStore();
const route = useRouter();
const webrtcLocalStorage = useStorage("atsumari_webrtc", {
  userAuthToken: "",
  userAuthTokenExpiry: "",
  isMicEnabled: false,
});

// TODO: I still don't know how to implement such a logic
// Another room for the users that are close to each other
const myClosePerimeterRoomName = "my-close-perimeter-room";

let roomName = ref<string>("general-hall-room");
let isUserInARoom = ref<boolean>(false);
let userToken = ref<string>("");
let isCurrentlyConnected = ref<boolean>(false);

const wssUrl = ref(`wss://${EnvVariables.livekitHostUrl}`);
const remoteVideoContainer = ref();
onMounted(() => {});

emitter.on("playerInRoom", async (data) => {
  console.log("Emit received", data, isCurrentlyConnected.value);

  if (data.isPlayerInARoom === true && !isCurrentlyConnected.value) {
    console.log("in room", data);

    isUserInARoom.value = true;
    roomName.value = data.roomName;
    isCurrentlyConnected.value = true;
    await joinRoom();
  } else if (data.isPlayerInARoom === false && isCurrentlyConnected) {
    isUserInARoom.value = false;
    roomName.value = "";

    leaveRoom();

    if (!webRtcStore.devices.isMicrophoneEnabled) {
      room.localParticipant.setMicrophoneEnabled(false);
    }

    console.log("outside of room", data);
  }
});

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

const joinRoom = async () => {
  userToken.value = await createToken();

  if (userToken.value) {
    console.log("User token is created", userToken.value);

    await prepareForConnection();
  }
};

const leaveRoom = () => {
  room.disconnect();
  isCurrentlyConnected.value = false;
};

const createToken = async (): Promise<string> => {
  try {
    console.log("Creating token");

    const createdToken = (await createAccessToken(
      roomName.value,
      generalStore.userName || Math.random().toString(36).substring(7)
    )) as string;

    if (createdToken.includes("error")) {
      console.log("Failed to create token.", createdToken);
      throw new Error("Failed to create token: " + createdToken);
    } else {
      console.log("Token created", createdToken);
      return createdToken as string;
    }
  } catch (error) {
    console.log("Catch. Failed to create token.", error);
    throw error;
  }
};

const prepareForConnection = async () => {
  console.log("Preparing connection...");

  try {
    await room.prepareConnection(wssUrl.value);
    console.log("Connection prepared.");
  } catch (error) {
    console.log("Failed to prepare connection.", error);
  }

  // Connect to room
  try {
    await room.connect(wssUrl.value, userToken.value);
    isCurrentlyConnected.value = true;
    console.log("Connected to room.");
  } catch (error) {
    console.log("Failed to connect to room.", error);

    // If token is invalid, create a new token and try again
    /*  createToken().then(async (token: string) => {
      userToken.value = token;
      await joinRoom();
    }); */
  }

  // Subscribe remote video and display it
  room.on(RoomEvent.TrackSubscribed, function (remoteTrack) {
    console.log("Trying to subscribe to remote track.");

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
    console.log("Track subscribed: ", track);
  });

  // Unsubscribe remote video and remove it
  room.on(RoomEvent.TrackUnsubscribed, function (remoteTrack) {
    console.log("Trying to unsubscribe from remote track.");

    const track = remoteTrack.detach();
    remoteVideoContainer.value.removeChild(track);

    console.log("Track unsubscribed : ", track);

    // Reset style
    track.style.width = "";
    track.style.height = "";
    track.style.objectFit = "";
    track.style.borderRadius = "";
    track.style.border = "";
    track.style.boxShadow = "";
  });

  // Enable camera and microphone
  // await room.localParticipant.setMicrophoneEnabled(true);
  // webRtcStore.devices.isMicrophoneEnabled = true;
};

// WATCHERS
let isMicEnabled = ref<boolean>(false);
let isCameraEnabled = ref<boolean>(false);
let isScreenShareEnabled = ref<boolean>(false);

watch(
  () => webRtcStore.devices.isMicrophoneEnabled,
  (newValue) => {
    isMicEnabled.value = newValue;

    if (isMicEnabled.value || webrtcLocalStorage.value.isMicEnabled) {
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
