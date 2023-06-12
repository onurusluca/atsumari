import { defineStore } from "pinia";
import type { User } from "@/types/canvasTypes";

export const useGeneralStore = defineStore("generalStore", {
  state: () => {
    return {
      spaceId: "" as string,
      users: [] as User[],
      spaceName: "" as string,
      userName: "" as string,
      characterSpriteName: "" as string,
      userStatus: "online" as string,
      userPersonalMessage: "" as string,
      initialSetupCompleted: false as boolean,
    };
  },
});
