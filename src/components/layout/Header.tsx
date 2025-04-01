'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

export const Header = () => {
  const { data: session, status } = useSession()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 bg-brand-darker/80 backdrop-blur-md">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-brand-purple hover:text-brand-pink transition-colors">
            LinkForge
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/docs"
            className="text-sm text-gray-400 hover:text-brand-purple transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-400 hover:text-brand-purple transition-colors"
          >
            Pricing
          </Link>

          <button className="p-2 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>

          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-brand-purple/10 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-brand-purple/10 transition-colors group"
              >
                {session?.user?.avatar ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={session.user.avatar}
                      alt={session.user.username || ''}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <UserCircleIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
                )}
                <span className="text-sm text-gray-300 group-hover:text-brand-purple transition-colors">
                  @{session?.user?.username}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-brand-darker/95 backdrop-blur-sm border border-gray-800/50 rounded-lg shadow-xl animate-fade-in">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Ayarlar
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
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-300 hover:text-brand-purple transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded bg-brand-purple hover:bg-brand-purple/90 text-white text-sm transition-colors animate-glow"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
} 