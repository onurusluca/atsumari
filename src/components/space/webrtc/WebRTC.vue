<script setup lang="ts">
import {
  ConnectionQuality,
  ConnectionState,
  DataPacket_Kind,
  DisconnectReason,
  LocalAudioTrack,
  LocalTrackPublication,
  LocalParticipant,
  LogLevel,
  MediaDeviceFailure,
  Participant,
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
  VideoPresets,
  VideoQuality,
  createAudioAnalyser,
  setLogLevel,
} from "livekit-client";

import type { SimulationScenario } from "livekit-client";

import { EnvVariables } from "@/envVariables";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

onMounted(() => {});

const LIVEKIT_API_KEY = EnvVariables.livekitApiKey;
const LIVEKIT_URL = EnvVariables.livekitUrl;
let token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODI1MDU3OTAsImlzcyI6IkFQSTJWVExXbllhejVNcSIsIm5iZiI6MTY4MjUwNDg5MCwic3ViIjoiZmFzZiIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiJhc2Zhc2YiLCJyb29tSm9pbiI6dHJ1ZX19.P7OYsI3oFz1clgcdak8LvTV7MhI-9hsXfZnZpVL0N40";

const state = {
  isFrontFacing: false,
  encoder: new TextEncoder(),
  decoder: new TextDecoder(),
  defaultDevices: new Map<MediaDeviceKind, string>(),
  bitrateInterval: undefined as any,
};
let currentRoom: Room | undefined;

let startTime: number;

const searchParams = new URLSearchParams(window.location.search);
const storedUrl = searchParams.get("url") ?? "ws://localhost:7880";
const storedToken = searchParams.get("token") ?? "";

function updateSearchParams(url: string, token: string) {
  const params = new URLSearchParams({ url, token });
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}
</script>

<template>
  <div class="webrtc"> </div>
</template>

<style scoped lang="scss">
.webrtc {
}
</style>
