'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { 
  ShieldCheckIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { sidebarLinks } from './constants'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

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

  // Debug için session bilgisini konsola yazdır
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Session:', session)
    }
  }, [session])

  // Tüm menüleri birleştir
  const allLinks = session?.user?.role && ['ADMIN', 'FOUNDER'].includes(session.user.role)
    ? [...sidebarLinks, ...adminLinks]
    : sidebarLinks

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-brand-darker border-r border-gray-800/50 z-40
        lg:sticky lg:top-16 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="h-full p-4 overflow-y-auto">
          <div className="space-y-2">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${pathname === link.href 
                    ? 'text-brand-purple bg-brand-purple/10' 
                    : 'text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10'
                  }
                `}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
} 