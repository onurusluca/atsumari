<script setup lang="ts">
import {
  connect,
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
} from 'livekit-client';


const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});



// creates a new room with options
const room = new Room({
  // automatically manage subscribed video quality
  adaptiveStream: true,

  // optimize publishing bandwidth and CPU for published tracks
  dynacast: true,

  // default capture settings
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
});

// set up event listeners
room
  .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
  .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
  .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
  .on(RoomEvent.Disconnected, handleDisconnect)
  .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);

// connect to room
await room.connect('ws://localhost:7800', token);
console.log('connected to room', room.name);

// publish local camera and mic tracks
await room.localParticipant.enableCameraAndMicrophone();

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant,
) {
  if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
    // attach it to a new HTMLVideoElement or HTMLAudioElement
    const element = track.attach();
    parentElement.appendChild(element);
  }
}

function handleTrackUnsubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant,
) {
  // remove tracks from all attached elements
  track.detach();
}

function handleLocalTrackUnpublished(track: LocalTrackPublication, participant: LocalParticipant) {
  // when local tracks are ended, update UI to remove them from rendering
  track.detach();
}

function handleActiveSpeakerChange(speakers: Participant[]) {
  // show UI indicators when participant is speaking
}

function handleDisconnect() {
  console.log('disconnected from room');
}
</script>

<template>
  <div class="webrtc"> </div>
</template>

<style scoped lang="scss">
.webrtc {
}
</style>
