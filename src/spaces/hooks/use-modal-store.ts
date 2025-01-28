import { Space, Channel } from '@/payload-types'
import { ModalType, ModalData } from '@/spaces/types'
import { create } from 'zustand'

interface ModalStore {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (type: ModalType, data?: ModalData) => void
  onClose: () => void
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}))

// Re-export ModalType for convenience
export { ModalType }
