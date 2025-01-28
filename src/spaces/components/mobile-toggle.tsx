// src/spaces/components/mobile-toggle.tsx
'use client'

import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { NavigationSidebar } from './navigation/navigation-sidebar'
import { SpaceSidebar } from './space/space-sidebar'
import { SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface MobileToggleProps {
  spaceId: string
}

export const MobileToggle = ({ spaceId }: MobileToggleProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden>
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        <SpaceSidebar spaceId={spaceId} />
      </SheetContent>
    </Sheet>
  )
}
