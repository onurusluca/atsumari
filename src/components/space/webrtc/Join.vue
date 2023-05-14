<script setup lang="ts">
import { EnvVariables } from "@/envVariables";
import { createAccessToken, listRooms, createRoom } from "@/composables/useWebrtc";
import { Room, RoomEvent, Participant } from "livekit-client";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

let wssUrl = ref("wss://atsumari.livekit.cloud");

const userToken = ref<string>(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Im5ldy1yb29tIn0sImlhdCI6MTY4NDA0NjY2NiwibmJmIjoxNjg0MDQ2NjY2LCJleHAiOjE2ODQwNjgyNjYsImlzcyI6IkFQSWI3aGhNbXdDSmpMaSIsInN1YiI6InNob3J0IiwianRpIjoic2hvcnQifQ.DjrClH_muy1l-6Km-S7k0DBd9ppJmqPpDUxNTlEIRDQ"
);
let roomName = ref<string>("new-room");
const room = new Room();
const localVideoContainer = ref();
const remoteVideoContainer = ref();
onMounted(async () => {});

const createAuthToken = async () => {
  return await createAccessToken(roomName.value, String(generalStore.userName));
};

const joinRoom = async () => {
  await createAuthToken().then(async (token) => {
    userToken.value = token;
    console.log("Click join room");

    await room.prepareConnection(wssUrl.value);

    room
      // publish local video and display it to localVideoContainer
      .on(RoomEvent.LocalTrackPublished, function (publication) {
        // const track = publication.track.attach();
        //localVideoContainer.value.appendChild(track);
      });

    // Publish screen share

    room
      // subscribe remote video and display it to remoteVideoContainer
      .on(RoomEvent.TrackSubscribed, function (remoteTrack) {
        const track = remoteTrack.attach();
        remoteVideoContainer.value.appendChild(track);
        console.log("Track subscribed");
      });

    await room.connect(wssUrl.value, userToken.value);
    room.localParticipant.enableCameraAndMicrophone();
    //await room.localParticipant.setMicrophoneEnabled(false);

    // Speaker detection
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      // speakers contain all of the current active speakers
    });
  });
};

const handleCreateRoom = async () => {
  const rooms = await createRoom("room-name", 532452, 2);
  console.log("Rooms", rooms);
};
/*
room.localParticipant.setCameraEnabled(false)
room.localParticipant.setMicrophoneEnabled(false)
room.localParticipant.enableCameraAndMicrophone();
*/

let micEnabled = ref<boolean>(true);
const muteMuteMic = async () => {
  if (micEnabled.value) {
    await room.localParticipant.setMicrophoneEnabled(false);
    micEnabled.value = false;
  } else {
    await room.localParticipant.setMicrophoneEnabled(true);
    micEnabled.value = true;
  }
};

let videoEnabled = ref<boolean>(true);
const muteVideo = async () => {
  if (videoEnabled.value) {
    await room.localParticipant.setCameraEnabled(false);
    videoEnabled.value = false;
  } else {
    await room.localParticipant.setCameraEnabled(true);
    videoEnabled.value = true;
  }
};

const handleShareScreen = async () => {
  await room.localParticipant.setScreenShareEnabled(true);

  console.log("Share screen");
  // await room.localParticipant.publishTrack(videoTrack);
};
</script>

<template>
  <div class="join">
    <button @click="handleCreateRoom"> Create Room </button>

    <button @click="createAuthToken"> Create Token </button>
    <button @click="joinRoom"> Join Room </button>

    <button @click="handleShareScreen">SHARE SCREEN</button>
    <!-- Mute -->
    <button @click="muteMuteMic">Mute</button>
    <!-- Video -->
    <button @click="muteVideo">Video</button>
    <div class="join__video" ref="remoteVideoContainer">remote</div>

    <!--     <div class="join__video" ref="localVideoContainer">local</div>
 -->
  </div>
</template>

<style scoped lang="scss">
.join {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  background-color: #1a202c; // Dark Background
  font-family: "Poppins", sans-serif;

  &__video {
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid blue;
    video {
      width: 5rem !important;
      height: 5rem !important;
    }
  }
}
</style>
