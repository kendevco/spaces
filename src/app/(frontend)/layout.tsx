import './globals.css'
import '@/app/(frontend)/globals.css'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return children
}
