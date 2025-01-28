import { User } from '@/payload-types'
import { create } from 'zustand'

interface CurrentProfileStore {
  user: User | null
  setUser: (user: User | null) => void
}

export const useCurrentProfile = create<CurrentProfileStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
