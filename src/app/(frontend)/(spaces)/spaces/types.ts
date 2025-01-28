import { ReactNode } from 'react'

export interface LayoutProps {
  children: ReactNode
  params: Promise<{ spaceId: string }> | { spaceId: string }
}

export interface PageProps {
  params:
    | Promise<{
        spaceId: string
        memberId?: string
      }>
    | {
        spaceId: string
        memberId?: string
      }
  searchParams?: Promise<{ video?: boolean }> | { video?: boolean }
}
