import { defineStore } from "pinia";
import type { UserSession } from "@/types/userSessionTypes";

export const userSessionStore = defineStore({
  id: "userSession",
  state: () => ({
    session: {} as UserSession,
  }),
});
