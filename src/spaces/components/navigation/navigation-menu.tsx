'use client'

import { Moon, Sun, Settings, LogOut, RefreshCw, Link as LinkIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useAuth } from '@/providers/Auth'

interface NavItem {
  link: {
    type: 'custom' | 'reference'
    url?: string
    label: string
    reference?: {
      relationTo: string
      value: {
        id: string
        slug: string
        title: string
      }
    }
  }
  id: string
}

interface HeaderData {
  navItems: NavItem[]
}

export function NavigationMenu() {
  const { setTheme, theme } = useTheme()
  const [isSyncing, setIsSyncing] = useState(false)
  const [headerLinks, setHeaderLinks] = useState<NavItem[]>([])
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    const fetchHeaderLinks = async () => {
      try {
        const response = await fetch('/api/globals/header?depth=1&draft=false')
        const data: HeaderData = await response.json()
        setHeaderLinks(data.navItems)
      } catch (error) {
        console.error('Error fetching header links:', error)
      }
    }

    fetchHeaderLinks()
  }, [])

  const handleSync = async () => {
    try {
      setIsSyncing(true)
      const response = await fetch('/api/messages/analyze/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      router.refresh()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getNavItemUrl = (item: NavItem) => {
    if (item.link.type === 'custom' && item.link.url) {
      return item.link.url.replace(/^\/pages\//, '/')
    }
    if (item.link.type === 'reference' && item.link.reference) {
      return `/${item.link.reference.relationTo}/${item.link.reference.value.slug}`.replace(
        /^\/pages\//,
        '/',
      )
    }
    return '#'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gradient-to-br hover:from-[#7364c0] hover:to-[#02264a] hover:text-white"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-gradient-to-br from-[#7364c0] to-[#02264a] text-white border border-gray-300"
        align="end"
        alignOffset={-3}
      >
        <DropdownMenuLabel className="text-white">Navigation</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="flex items-center hover:bg-white/10 cursor-pointer" href="/">
              <LinkIcon className="mr-2 h-4 w-4" />
              Home
            </Link>
          </DropdownMenuItem>
          {headerLinks.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                href={getNavItemUrl(item)}
                className="flex items-center hover:bg-white/10 cursor-pointer"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                {item.link.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuLabel className="text-white">Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="flex items-center hover:bg-white/10 cursor-pointer" href="/account">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/logout" className="flex items-center hover:bg-white/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
