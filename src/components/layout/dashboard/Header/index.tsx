'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { 
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export const Header = ({ isSidebarOpen, onSidebarToggle }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 h-16 bg-brand-darker border-b border-gray-800/50 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 hover:bg-gray-800/50 rounded-lg"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-400" />
            )}
          </button>
          <Link href="/" className="text-xl font-bold text-brand-purple hover:text-brand-pink transition-colors">
            LinkForge
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800/50 rounded-lg">
            <BellIcon className="w-6 h-6 text-gray-400" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 hover:bg-gray-800/50 rounded-lg flex items-center gap-2"
            >
              {session?.user?.avatar ? (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={session.user.avatar}
                    alt={session.user.username || ''}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <UserCircleIcon className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {/* Profil Menüsü */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-brand-darker/95 backdrop-blur-sm border border-gray-800/50 rounded-lg shadow-xl animate-fade-in">
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profil Ayarları
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' })
                    setIsProfileOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 