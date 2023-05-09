<script setup lang="ts">
import {
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  selectIsSomeoneScreenSharing,
  selectScreenShareByPeerID,
  selectIsLocalAudioPluginPresent,
  selectConnectionQualityByPeerID,
} from "@100mslive/hms-video-store";
import type { HMSPeer, HMSTrackID } from "@100mslive/hms-video-store";
import { HMSNoiseSuppressionPlugin } from "@100mslive/hms-noise-suppression";

import type { HMSConnectionQuality } from "@/types/webrtcTypes";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();

const videoRefs: any = reactive({});
const screenShareRef: any = ref(null);

const remotePeerProps: any = reactive({});
const allPeers = ref<HMSPeer[]>([]);
const isAudioEnabled = ref(hmsStore.getState(selectIsLocalAudioEnabled));
const isVideoEnabled = ref(hmsStore.getState(selectIsLocalVideoEnabled));
const isScreenShareEnabled = ref(hmsStore.getState(selectIsSomeoneScreenSharing));
const noiseSuppressionPlugin = new HMSNoiseSuppressionPlugin();

const isScreenSharingEnabled = ref(false);

enum MediaState {
  isAudioEnabled = "isAudioEnabled",
  isVideoEnabled = "isVideoEnabled",
  isScreenShareEnabled = "isScreenShareEnabled",
}
let isJoined = ref<boolean>(false);
emitter.on("playerInRoom", (data: any) => {
  if (data === false && isJoined.value) {
    // console.log("leaving room", data);
    if (allPeers.value.length) {
      //  console.log("leaving meeting");

      leaveMeeting();
      isJoined.value = false;
    }
  } else if (data === true && !isJoined.value) {
    //  console.log("joining room", data);
    isJoined.value = true;
  }
});

onUnmounted(() => {
  if (allPeers.value.length) {
    leaveMeeting();
  }
});

// Leave the meeting when the user closes or refreshes the
window.addEventListener("beforeunload", () => {
  leaveMeeting();
});

const leaveMeeting = () => {
  hmsActions.leave();
};

// Nose suppression plugin support checck
async function checkSuppressionPluginSupport(): Promise<boolean> {
  const pluginSupport = hmsActions.validateAudioPluginSupport(noiseSuppressionPlugin);
  if (pluginSupport.isSupported) {
    // console.log("Plugin is supported");
    return true;
  } else {
    const err = pluginSupport.errMsg;
    console.error(
      "Nose suppression plugin support failed. Probably doesn't support.",
      err
    );
    return false;
  }
}
async function toggleNoiseSuppression() {
  const isNoiseSuppressed = hmsStore.getState(
    selectIsLocalAudioPluginPresent(noiseSuppressionPlugin.getName())
  );
  try {
    if (!isNoiseSuppressed) {
      // add background noise suppression
      await hmsActions.addPluginToAudioTrack(noiseSuppressionPlugin);

      //console.log("noise suppression success - ", isNoiseSuppressed);
    } else {
      // remove background noise suppression
      await hmsActions.removePluginFromAudioTrack(noiseSuppressionPlugin);
    }
  } catch (err) {
    console.log("noise suppression failure - ", isNoiseSuppressed, err);
  }
}
async function initNoiseSuppression() {
  //console.log("allPeers connected", allPeers.value);
  let doesBrowserSupportNoiseSuppression = false;
  checkSuppressionPluginSupport().then((res) => {
    doesBrowserSupportNoiseSuppression = res;
    if (doesBrowserSupportNoiseSuppression) {
      //console.log("adding noise suppression plugin");

      noiseSuppressionPlugin.init();
      toggleNoiseSuppression();
    } else {
      console.log("browser does not support noise suppression plugin");
    }
  });
}

const onAudioChange = (newAudioState: boolean) => {
  isAudioEnabled.value = newAudioState;
};
const onVideoChange = (newVideoState: boolean) => {
  isVideoEnabled.value = newVideoState;
};
const onScreenShareChange = (newScreenShareState: boolean) => {
  isScreenShareEnabled.value = newScreenShareState;
};

const onPeerAudioChange = (isEnabled: boolean, peerId: string) => {
  if (videoRefs[peerId]) {
    remotePeerProps[peerId][MediaState.isAudioEnabled] = isEnabled;
  }
};
const onPeerVideoChange = (isEnabled: boolean, peerId: string) => {
  if (videoRefs[peerId]) {
    remotePeerProps[peerId][MediaState.isVideoEnabled] = isEnabled;
  }
};
const onPeerScreenShareChange = (isEnabled: boolean, peerId: string) => {
  if (videoRefs[peerId]) {
    remotePeerProps[peerId][MediaState.isScreenShareEnabled] = isEnabled;
  }
};

let webRtcConnectionQuality = ref<HMSConnectionQuality | null>(null);
const renderPeers = (peers: HMSPeer[]) => {
  // console.log("renderPeers", peers);

  allPeers.value = peers;
  peers.forEach(async (peer: HMSPeer) => {
    if (videoRefs[peer.id]) {
      hmsActions.attachVideo(peer.videoTrack as HMSTrackID, videoRefs[peer.id]);

      // If the peer is a remote peer, attach a listener to get video and audio states
      if (!peer.isLocal) {
        // Set up a property to track the audio and video states of remote peer so that
        if (!remotePeerProps[peer.id]) {
          remotePeerProps[peer.id] = {};
        }
        remotePeerProps[peer.id][MediaState.isAudioEnabled] = hmsStore.getState(
          selectIsPeerAudioEnabled(peer.id)
        );
        remotePeerProps[peer.id][MediaState.isVideoEnabled] = hmsStore.getState(
          selectIsPeerVideoEnabled(peer.id)
        );
        remotePeerProps[peer.id][MediaState.isScreenShareEnabled] = hmsStore.getState(
          selectScreenShareByPeerID(peer.id)
        );

        // Subscribe to the audio and video changes of the remote peer
        hmsStore.subscribe(
          (isEnabled) => onPeerAudioChange(isEnabled, peer.id),
          selectIsPeerAudioEnabled(peer.id)
        );
        hmsStore.subscribe(
          (isEnabled) => onPeerVideoChange(isEnabled, peer.id),
          selectIsPeerVideoEnabled(peer.id)
        );
        hmsStore.subscribe(
          (isEnabled) => onPeerScreenShareChange(isEnabled, peer.id),
          selectScreenShareByPeerID(peer.id)
        );

        // Subscribe to the connection quality of the remote peer. Only activates if a peer is available
        hmsStore.subscribe((connectionQuality) => {
          console.log("subscribed to connection quality");

          if (connectionQuality) {
            webRtcConnectionQuality.value = connectionQuality.downlinkQuality;

            console.log("connectionQuality", connectionQuality.downlinkQuality);
          }
        }, selectConnectionQualityByPeerID(peer.id));

        console.log("allPeers connected", allPeers.value);

        // After the peer is connected, initialize the noise suppression plugin
        await initNoiseSuppression();
      }
    }
  });
};

const toggleAudio = async () => {
  const enabled = hmsStore.getState(selectIsLocalAudioEnabled);
  await hmsActions.setLocalAudioEnabled(!enabled);
};

const toggleVideo = async () => {
  const enabled = hmsStore.getState(selectIsLocalVideoEnabled);
  await hmsActions.setLocalVideoEnabled(!enabled);
  // rendering again is required for the local video to show after turning off
  renderPeers(hmsStore.getState(selectPeers));
};

const toggleScreenShare = async () => {
  const enabled = hmsStore.getState(selectIsSomeoneScreenSharing);
  await hmsActions.setScreenShareEnabled(!enabled);
};

// HMS Listeners
hmsStore.subscribe(renderPeers, selectPeers);
hmsStore.subscribe(onAudioChange, selectIsLocalAudioEnabled);
hmsStore.subscribe(onVideoChange, selectIsLocalVideoEnabled);
hmsStore.subscribe(onScreenShareChange, selectIsSomeoneScreenSharing);
</script>

<template>
  <main class="main-container">
    <p class="connection-quality">CONNECTION QUALITY: {{ webRtcConnectionQuality }}</p>
    <div class="video-grid">
      <div v-for="peer in allPeers" :key="peer.id" class="video-container">
        <!--  <video
          autoplay
          :muted="peer.isLocal"
          playsinline
          class="video-element"
          :ref="
            (el) => {
              if (el) videoRefs[peer.id] = el;
            }
          "
        ></video> -->

        <video
          autoplay
          playsinline
          class="video-element"
          :ref="
            (el) => {
              if (el) videoRefs[peer.id] = el;
            }
          "
        ></video>

        <div class="video-label">
          <span
            class="audio-icon"
            v-show="
              (peer.isLocal && isAudioEnabled) ||
              (!peer.isLocal && remotePeerProps?.[peer.id]?.[MediaState.isAudioEnabled])
            "
          >
            <!-- Audio Enabled  -->
          </span>
          <span
            class="audio-mute-icon"
            v-show="
              (peer.isLocal && !isAudioEnabled) ||
              (!peer.isLocal &&
                !remotePeerProps?.[peer.id]?.[MediaState.isAudioEnabled])
            "
          >
            <!-- Audio Disabled -->
          </span>
          <span class="peer-name">{{
            peer.isLocal ? `You (${peer.name})` : peer.name
          }}</span>
        </div>

        <!-- Screen share Disabled -->
        <p
          class="camera-off-text"
          v-show="
            (peer.isLocal && !isScreenSharingEnabled) ||
            (!peer.isLocal &&
              !remotePeerProps?.[peer.id]?.[MediaState.isScreenShareEnabled])
          "
        >
          Screen Share Disabled
        </p>

        <!--         <p
          class="camera-off-text"
          v-show="
            (peer.isLocal && !isVideoEnabled) ||
            (!peer.isLocal && !remotePeerProps?.[peer.id]?.[MediaState.isVideoEnabled])
          "
        >
          Camera Off
        </p> -->
      </div>
    </div>

    <div class="action-buttons" v-if="allPeers.length">
      <button class="audio-toggle-button" @click="toggleAudio">
        {{ isAudioEnabled ? "Mute" : "Unmute" }} Microphone
      </button>
      <button class="video-toggle-button" @click="toggleVideo">
        {{ isVideoEnabled ? "Mute" : "Unmute" }} Camera
      </button>
      <button class="screenshare-toggle-button" @click="toggleScreenShare">
        {{ isScreenSharingEnabled ? "Stop Sharing" : "Share Screen" }}
      </button>
      <button class="leave-meeting-button" @click="leaveMeeting">
        Leave Meeting
      </button>
    </div>
    <div v-else>
      <p class="loading-text"> Hold On!, Loading Video Tiles... </p>
    </div>
  </main>
</template>
<style scoped lang="scss">
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  background-color: #1a202c; // Dark Background
  font-family: "Poppins", sans-serif;
}

.connection-quality {
  margin-bottom: 1rem;
  color: #fbbf24; // Amber
  font-weight: 700;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.5rem;
}

.video-container {
  position: relative;
}

.video-element {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.video-label {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.audio-icon,
.audio-mute-icon {
  display: inline-block;
  width: 1.5rem;
  margin-right: 0.5rem;
}

.peer-name {
  display: inline-block;
}

.camera-off-text {
  color: white;
  text-align: center;
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  transform: translateY(-50%);
}

.action-buttons {
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button {
  background-color: #38a169; // Teal
  color: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
  display: block;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  &.audio-toggle-button {
    margin-right: 1.25rem;
  }

  &.video-toggle-button {
    margin-right: 1.25rem;
    background-color: #9333ea; // Indigo
  }

  &.leave-meeting-button {
    background-color: #b91c1c; // Rose
  }

  &.screenshare-toggle-button {
    margin-right: 1.25rem;
    background-color: #4f46e5; // Violet
  }
}

.loading-text {
  color: white;
  text-align: center;
  font-weight: 700;
  font-size: 1.5rem;
}
</style>
