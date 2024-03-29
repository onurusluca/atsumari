import { defineStore } from "pinia";
import type { DevicesStoreTypes } from "@/types/webrtcTypes";

export const useWebRtcStore = defineStore("webrtcStore", {
  state: () => {
    return {
      devices: {
        microphoneName: "",
        cameraName: "",
        isMicrophoneEnabled: false,
        isCameraEnabled: false,
        isMicrophoneMuted: false,
        isCameraMuted: false,
        isScreenSharing: false,
      } as DevicesStoreTypes,
    };
  },
});
