'use client'

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'

interface RootLayoutClientProps {
  children: React.ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname()
  
  // Dashboard veya kullanıcı profil sayfasında mıyız kontrol et
  const isDashboard = pathname?.startsWith('/dashboard')
  const isUserProfile = pathname?.split('/').length === 2 && pathname !== '/'

  // Header ve Footer'ı göster/gizle
  const shouldShowHeaderFooter = !isDashboard && !isUserProfile

  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-brand-purple/5 via-transparent to-transparent pointer-events-none" />
        
        {shouldShowHeaderFooter && <Header />}
        <main className={`flex-grow ${shouldShowHeaderFooter ? 'pt-16' : ''} relative`}>
          {children}
        </main>
        {shouldShowHeaderFooter && <Footer />}
      </div>
    </SessionProvider>
  )
} 