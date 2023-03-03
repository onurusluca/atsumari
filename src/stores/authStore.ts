import { defineStore } from 'pinia'
import type { Session, User } from '@/types/authTypes'

export const useAuthStore = defineStore('authStore', {
  state: () => {
    return { session: {} as Session, user: {} as User }
  },
  actions: {
    increment() {},
  },
})
