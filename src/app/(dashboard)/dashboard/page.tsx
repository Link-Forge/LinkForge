'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  ChartBarIcon,
  LinkIcon,
  ArrowPathIcon,
  PlusIcon,
  UserCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Stats {
  viewCount: number
  activeLinks: number
  totalClicks: number
  recentActivities: Array<{
    type: string
    details: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    viewCount: 0,
    activeLinks: 0,
    totalClicks: 0,
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/user/stats')
        if (!response.ok) throw new Error('İstatistikler yüklenemedi')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error(error)
        toast.error('İstatistikler yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleAddLink = () => {
    router.push('/dashboard/links')
  }

  const handleEditProfile = () => {
    router.push('/dashboard/profile')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Linklerinizi ve istatistiklerinizi yönetin</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-4">
          <div className="p-2 bg-brand-purple/10 w-fit rounded-lg">
            <ChartBarIcon className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Toplam Görüntülenme</h3>
            <p className="text-2xl font-semibold text-white mt-1">
              {loading ? (
                <ArrowPathIcon className="w-6 h-6 animate-spin" />
              ) : (
                stats.viewCount
              )}
            </p>
          </div>
        </div>

        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-4">
          <div className="p-2 bg-brand-purple/10 w-fit rounded-lg">
            <LinkIcon className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Aktif Link</h3>
            <p className="text-2xl font-semibold text-white mt-1">
              {loading ? (
                <ArrowPathIcon className="w-6 h-6 animate-spin" />
              ) : (
                stats.activeLinks
              )}
            </p>
          </div>
        </div>

        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-4">
          <div className="p-2 bg-brand-purple/10 w-fit rounded-lg">
            <ChartBarIcon className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Toplam Tıklanma</h3>
            <p className="text-2xl font-semibold text-white mt-1">
              {loading ? (
                <ArrowPathIcon className="w-6 h-6 animate-spin" />
              ) : (
                stats.totalClicks
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-brand-purple" />
              </div>
            ) : stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 py-3 border-b border-gray-800/50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{activity.details}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center">Henüz aktivite yok</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Hızlı İşlemler</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleAddLink}
              className="w-full flex items-center gap-2 p-3 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors group"
            >
              <PlusIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Yeni Link Ekle</span>
            </button>

            <button
              onClick={handleEditProfile}
              className="w-full flex items-center gap-2 p-3 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors group"
            >
              <UserCircleIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Profili Düzenle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 