'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { sidebarLinks } from './constants'
import { 
  ShieldCheckIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Admin menüleri
  const adminLinks = [
    {
      name: 'Admin Panel',
      href: '/dashboard/admin',
      icon: ShieldCheckIcon
    },
    {
      name: 'Kullanıcılar',
      href: '/dashboard/admin/users',
      icon: UsersIcon
    }
  ]

  // Tüm menüleri birleştir
  const allLinks = session?.user?.role === 'ADMIN' 
    ? [...sidebarLinks, ...adminLinks]
    : sidebarLinks

  return (
    <div className="h-full flex-1 flex flex-col gap-6 overflow-hidden bg-brand-darker/50 backdrop-blur-sm border-r border-gray-800/50">
      <div className="flex-1 flex flex-col gap-2 px-2 py-4 overflow-auto">
        {allLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              pathname === link.href
                ? 'text-white bg-brand-purple/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  )
} 