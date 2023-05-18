import { defineStore } from "pinia";
import type { User } from "@/types/general";

export const useGeneralStore = defineStore("generalStore", {
  state: () => {
    return {
      spaceId: "" as string,
      spaceName: "" as string,
      userId: "" as string,
      userName: "" as string,
      users: [] as User[],
      userStatus: "online" as string,
      userPersonalMessage: "" as string,
    };
  },
});
