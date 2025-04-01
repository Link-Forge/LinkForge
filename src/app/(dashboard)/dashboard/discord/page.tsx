'use client'

import { 
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const features = [
  'Discord durumunu otomatik güncelle',
  'Sunucu istatistiklerini göster',
  'Özel komutlarla profilini yönet',
  'Rol bazlı özelleştirmeler',
  'Otomatik link paylaşımı'
]

const connectedServer = {
  id: '123456789',
  name: 'Örnek Sunucu',
  memberCount: 100,
  icon: '/discord-server-icon.png'
}

export default function DiscordPage() {
  const { data: session } = useSession()
  const isConnected = false // Bu değer backend'den gelecek

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Discord Entegrasyonu</h2>
          <p className="text-gray-400 mt-1">Discord hesabını bağla ve özel özellikleri kullan</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Bağlantı Durumu</h3>
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Discord hesabın bağlı</span>
              </div>

              <div className="p-4 bg-brand-darker rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={connectedServer.icon}
                    alt={connectedServer.name}
                    className="w-12 h-12 rounded-full bg-gray-800"
                  />
                  <div>
                    <h4 className="text-white font-medium">{connectedServer.name}</h4>
                    <p className="text-sm text-gray-400">{connectedServer.memberCount} üye</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm">
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-400">
                <XCircleIcon className="w-5 h-5" />
                <span>Discord hesabın bağlı değil</span>
              </div>

              <button className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                <span>Discord ile Bağlan</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Özellikler</h3>
          
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 bg-brand-purple/10 rounded-lg">
            <p className="text-sm text-brand-purple">
              Discord botunu sunucuna ekleyerek tüm özellikleri kullanmaya başlayabilirsin.
            </p>
          </div>
        </div>

        {/* Bot Settings */}
        <div className="lg:col-span-2 p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Bot Ayarları</h3>
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Durum Mesajı
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: linkforge.lol/kullaniciadi"
                    className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Otomatik Paylaşım Kanalı
                  </label>
                  <select className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors">
                    <option value="">Kanal Seç</option>
                  </select>
                </div>
              </div>

              <button className="py-2.5 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors">
                Ayarları Kaydet
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Bot ayarlarını görmek için Discord hesabını bağlamalısın</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 