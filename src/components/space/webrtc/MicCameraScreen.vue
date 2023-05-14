<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const webRtcStore = useWebRtcStore();
const route = useRouter();

let isMicEnabled = ref<boolean>(false);
let isCameraEnabled = ref<boolean>(false);
let isScreenShareEnabled = ref<boolean>(false);

onMounted(() => {});

const handleToggleMicrophone = () => {
  console.log("toggle microphone");
  if (isMicEnabled.value) {
    isMicEnabled.value = false;
  } else {
    isMicEnabled.value = true;
  }
};

const handleToggleCamera = () => {
  console.log("toggle camera");
  if (isCameraEnabled.value) {
    isCameraEnabled.value = false;
  } else {
    isCameraEnabled.value = true;
  }
};

const handleToggleScreenShare = () => {
  console.log("toggle screen share");
  if (isScreenShareEnabled.value) {
    isScreenShareEnabled.value = false;
  } else {
    isScreenShareEnabled.value = true;
  }
};
</script>

<template>
  <div class="mic-camera-screen">
    <button
      @click="handleToggleMicrophone"
      class="btn btn-no-style device-buttons"
      :class="isMicEnabled ? 'device-button-enabled' : 'device-button-disabled'"
    >
      <ph:microphone-fill v-show="isMicEnabled" />
      <ph:microphone-slash-fill v-show="!isMicEnabled" />
    </button>

    <button
      @click="handleToggleCamera"
      class="btn btn-no-style device-buttons"
      :class="isCameraEnabled ? 'device-button-enabled' : 'device-button-disabled'"
    >
      <ph:video-camera-fill v-show="isCameraEnabled" />
      <ph:video-camera-slash-fill v-show="!isCameraEnabled" />
    </button>

    <button
      @click="handleToggleScreenShare"
      class="btn btn-no-style device-buttons"
      :class="isScreenShareEnabled ? 'device-button-enabled' : 'device-button-disabled'"
    >
      <ph:monitor-fill />
    </button>
  </div>
</template>

<style scoped lang="scss">
.mic-camera-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.device-buttons {
  width: 3rem;
  border-radius: 1.5rem;
  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
}

.device-button-disabled {
  background-color: rgba(255, 0, 0, 0.247);
  svg {
    color: rgba(255, 0, 0, 0.808);
  }

  &:hover {
    background-color: rgba(255, 0, 0, 0.39);
    svg {
      color: rgba(255, 0, 0, 0.897);
    }
  }
}

.device-button-enabled {
  background-color: rgba(1, 255, 1, 0.247);
  svg {
    color: rgba(0, 255, 0, 0.808);
  }

  &:hover {
    background-color: rgba(1, 255, 1, 0.39);
    svg {
      color: rgba(0, 255, 0, 0.897);
    }
  }
}
</style>
