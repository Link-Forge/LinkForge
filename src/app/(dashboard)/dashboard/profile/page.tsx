'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface ProfileSettings {
  description: string
  avatar?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<ProfileSettings>({
    description: '',
    avatar: ''
  })

  // Mevcut ayarları yükle
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/user/profile')
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Ayarlar yüklenemedi')
        }
        const data = await response.json()
        setSettings({
          description: data.description || '',
          avatar: data.avatar || ''
        })
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Ayarlar yüklenirken bir hata oluştu')
      }
    }
    loadSettings()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const loadingToast = toast.loading('Ayarlar kaydediliyor...')
    
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ayarlar kaydedilemedi')
      }

      const data = await response.json()
      setSettings(data.data)
      
      toast.success('Profil ayarları başarıyla kaydedildi! 🎉', {
        id: loadingToast
      })
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu', {
        id: loadingToast
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Profil</h2>
          <p className="text-gray-400 mt-1">Profil bilgilerini düzenle</p>
        </div>

        <Link
          href={`/${session?.user?.username}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors group"
        >
          <span>Profilimi Görüntüle</span>
          <ArrowTopRightOnSquareIcon className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-6">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-300">
              Açıklama
            </label>
            <input
              id="description"
              type="text"
              value={settings.description}
              onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Örn: Benim linklerim"
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="avatar" className="text-sm font-medium text-gray-300">
              Profil Resmi URL (İsteğe bağlı)
            </label>
            <input
              id="avatar"
              type="text"
              value={settings.avatar || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </form>
    </div>
  )
} 