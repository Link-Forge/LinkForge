'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface UserSettings {
  username: string
  email: string
  avatar?: string
  notifications?: {
    email?: {
      followers?: boolean
      clicks?: boolean
      security?: boolean
    }
  }
  visibility?: 'public' | 'followers' | 'private'
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    email: '',
    avatar: '',
    notifications: {
      email: {
        followers: false,
        clicks: false,
        security: true
      }
    },
    visibility: 'public'
  })

  // Kullanıcı ayarlarını getir
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/user/settings')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error)
        }

        setSettings(data)
      } catch (error) {
        setError('Ayarlar yüklenirken bir hata oluştu')
        console.error(error)
      }
    }

    fetchSettings()
  }, [])

  // Profil güncelleme
  const handleProfileUpdate = async (formData: FormData) => {
    const loadingToast = toast.loading('Profil ayarları kaydediliyor...')
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          avatar: formData.get('avatar')
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bir hata oluştu')
      }

      const data = await response.json()
      
      // Session'ı güncelle
      await session.update({
        ...session,
        user: {
          ...session?.user,
          username: data.username,
          email: data.email,
          avatar: data.avatar
        }
      })

      toast.success('Profil ayarları kaydedildi', { id: loadingToast })
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast })
    }
  }

  // Şifre güncelleme
  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const currentPassword = formData.get('current_password') as string
      const newPassword = formData.get('new_password') as string
      const passwordConfirmation = formData.get('password_confirmation') as string

      if (newPassword !== passwordConfirmation) {
        throw new Error('Şifreler eşleşmiyor')
      }

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'password',
          data: {
            currentPassword,
            newPassword
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      setSuccess('Şifre güncellendi')
      e.currentTarget.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Hesap silme
  async function handleAccountDelete() {
    if (!window.confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      await signOut({ callbackUrl: '/' })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
      setLoading(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-400">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ayarlar</h2>
          <p className="text-gray-400 mt-1">Hesap ayarlarını buradan yönetebilirsin</p>
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

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
          <p className="text-green-500">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profil Bilgileri */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-6">
          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-2">
              <label htmlFor="avatar" className="text-sm font-medium text-gray-300">
                Profil Resmi URL
              </label>
              <input
                id="avatar"
                name="avatar"
                type="text"
                defaultValue={settings.avatar || ''}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                name="username"
                defaultValue={settings.username}
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                defaultValue={settings.email}
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>

        {/* Güvenlik Ayarları */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <KeyIcon className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">Güvenlik</h3>
              <p className="text-sm text-gray-400 mt-1">Hesap güvenlik ayarlarını yönet</p>

              <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    required
                    className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    required
                    className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    required
                    className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <BellIcon className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">Bildirimler</h3>
              <p className="text-sm text-gray-400 mt-1">Bildirim tercihlerini ayarla</p>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="notifications_followers"
                      defaultChecked={settings.notifications?.email?.followers}
                      className="w-4 h-4 rounded border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
                    />
                    <span className="text-sm text-gray-300">Yeni takipçi bildirimleri</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="notifications_clicks"
                      defaultChecked={settings.notifications?.email?.clicks}
                      className="w-4 h-4 rounded border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
                    />
                    <span className="text-sm text-gray-300">Link tıklanma bildirimleri</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="notifications_security"
                      defaultChecked={settings.notifications?.email?.security}
                      className="w-4 h-4 rounded border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
                    />
                    <span className="text-sm text-gray-300">Güvenlik bildirimleri</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gizlilik Ayarları */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <GlobeAltIcon className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">Gizlilik</h3>
              <p className="text-sm text-gray-400 mt-1">Profil gizlilik ayarlarını düzenle</p>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      defaultChecked={settings.visibility === 'public'}
                      className="w-4 h-4 border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
                    />
                    <span className="text-sm text-gray-300">Herkese Açık</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="followers"
                      defaultChecked={settings.visibility === 'followers'}
                      className="w-4 h-4 border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
                    />
                    <span className="text-sm text-gray-300">Sadece Takipçiler</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      defaultChecked={settings.visibility === 'private'}
                      className="w-4 h-4 border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
                    />
                    <span className="text-sm text-gray-300">Gizli</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tehlikeli Bölge */}
        <div className="p-6 bg-red-500/5 backdrop-blur-sm border border-red-500/10 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrashIcon className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-500">Tehlikeli Bölge</h3>
              <p className="text-sm text-gray-400 mt-1">
                Bu işlemler geri alınamaz, dikkatli olun
              </p>

              <div className="mt-6">
                <button
                  onClick={handleAccountDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'İşlem yapılıyor...' : 'Hesabı Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 