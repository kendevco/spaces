'use client'

import { create } from 'zustand'
import type { SafeUser } from '@/spaces/types/user'

interface AuthStore {
  user: SafeUser | null
  isLoading: boolean
  setUser: (user: SafeUser | null) => void
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isLoading: false,
    }),
}))
