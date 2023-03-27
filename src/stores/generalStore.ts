import { defineStore } from "pinia";
import type { User } from "@/types/general";

export const useGeneralStore = defineStore("generalStore", {
  state: () => {
    return {
      spaceId: "",
      spaceName: "",
      userId: "",
      userName: "",
      users: [] as User[],
    };
  },
});
