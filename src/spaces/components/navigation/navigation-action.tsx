// path: src/components/Spaces/navigation/navigation-action.tsx
'use client'

import { Plus } from 'lucide-react'

import { ActionTooltip } from '@/spaces/components/action-tooltip'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { ModalType } from '@/spaces/types'

export const NavigationAction = () => {
  const { onOpen } = useModal()

  return (
    <div>
      <ActionTooltip side="right" align="center" label="Add a space">
        <button
          onClick={() => onOpen(ModalType.CREATE_SPACE)}
          className="group flex items-center"
          title="Add a space"
          aria-label="Add a space"
        >
          <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
            <Plus className="group-hover:text-white transition text-emerald-500" size={25} />
            <span className="sr-only">Add a space</span>
          </div>
        </button>
      </ActionTooltip>
    </div>
  )
}
