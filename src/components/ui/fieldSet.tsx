import type { ComponentProps } from 'react'

import { cn } from '@/utilities/cn'

export function Fieldset({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={cn(className, 'space-y-2')} />
}
