import { defineStore } from "pinia";
import type { User } from "@/types/canvasTypes";

export const useGeneralStore = defineStore("generalStore", {
  state: () => {
    return {
      spaceId: "" as string,
      spaceName: "" as string,
      userName: "" as string,
      characterSpriteName: "" as string,
      users: [] as User[],
      userStatus: "online" as string,
      userPersonalMessage: "" as string,
      initialSetupCompleted: false as boolean,
    };
  },
});
