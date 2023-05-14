import { defineStore } from "pinia";
import type { User } from "@/types/general";

export const useGeneralStore = defineStore("generalStore", {
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
      },
    };
  },
});
