'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Bars3Icon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 h-16 border-b border-gray-800/50 bg-brand-darker/95 backdrop-blur-sm z-50">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <Link href="/" className="text-xl font-bold text-brand-purple hover:text-brand-pink transition-colors">
            LinkForge
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
            >
              <UserCircleIcon className="w-5 h-5" />
            </button>

            {/* Profil Menüsü */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-brand-darker/95 backdrop-blur-sm border border-gray-800/50 rounded-lg shadow-xl z-50 animate-fade-in">
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profil Ayarları
                </Link>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
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