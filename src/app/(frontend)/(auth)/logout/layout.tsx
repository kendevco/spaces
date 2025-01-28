import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logout',
  description: 'Logging out of your account',
}

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
