<script setup lang="ts">
import { Room, RoomEvent } from "livekit-client";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

const token1 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODM4ODA5NzcsImlzcyI6ImRldmtleSIsIm5hbWUiOiJ1c2VyMSIsIm5iZiI6MTY4Mzc5NDU3Nywic3ViIjoidXNlcjEiLCJ2aWRlbyI6eyJyb29tIjoibXktZmlyc3Qtcm9vbSIsInJvb21Kb2luIjp0cnVlfX0.fdFFL-MQoqPqot5P2GmFbMaGcMO4RrSu5JQbD6uhuZA";
const token2 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODM4ODE5NjAsImlzcyI6ImRldmtleSIsIm5hbWUiOiJ1c2VyMSIsIm5iZiI6MTY4Mzc5NTU2MCwic3ViIjoidXNlcjEiLCJ2aWRlbyI6eyJyb29tIjoibXktZmlyc3Qtcm9vbSIsInJvb21Kb2luIjp0cnVlfX0.kg6icquyZ56uvgN-LK7wOJXk_H_CiCkSdUUgyKWvYd0";
const room = new Room();
const localVideoContainer = ref();
const remoteVideoContainer = ref();
onMounted(async () => {
  await room.prepareConnection("ws://localhost:7880");

  room
    // publish local video and display it to localVideoContainer
    .on(RoomEvent.LocalTrackPublished, function (publication) {
      const track = publication.track.attach();
      localVideoContainer.value.appendChild(track);
    });

  // Publish screen share

  room.localParticipant
    .publishTrack(videoTrack)

    // subscribe remote video and display it to remoteVideoContainer
    .on(RoomEvent.TrackSubscribed, function (remoteTrack) {
      const track = remoteTrack.attach();
      remoteVideoContainer.value.appendChild(track);
      console.log("Track subscribed");
    });

  await room.connect(
    "ws://localhost:7880",
    generalStore.userName == "short" ? token1 : token2
  );
  await room.localParticipant.setMicrophoneEnabled(false);

  // await room.localParticipant.enableCameraAndMicrophone();
});

/*

*/

/*
room.localParticipant.setCameraEnabled(false)
room.localParticipant.setMicrophoneEnabled(false)
*/

const handleShareScreen = async () => {
  await room.localParticipant.setScreenShareEnabled(true);

  console.log("Share screen");
  await room.localParticipant.publishTrack(videoTrack);
};
</script>

<template>
  <div class="join">
    <!--     <div class="join__video" ref="localVideoContainer">local</div> -->
    <button @click="handleShareScreen">SHARE SCREEN</button>
    <div class="join__videos" ref="remoteVideoContainer">remote</div>
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
    width: 100%;
    height: 100%;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    video {
      width: 5rem !important;
      height: 5rem !important;
    }
  }
}
</style>
