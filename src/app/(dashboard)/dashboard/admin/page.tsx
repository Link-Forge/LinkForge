import {
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  FlagIcon
} from '@heroicons/react/24/outline'

const adminStats = [
  {
    name: 'Toplam Kullanıcı',
    value: '1,234',
    change: '+12%',
    icon: UsersIcon,
  },
  {
    name: 'Aktif Kullanıcı',
    value: '891',
    change: '+7%',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Toplam Link',
    value: '5,678',
    change: '+25%',
    icon: ChartBarIcon,
  },
  {
    name: 'Raporlar',
    value: '3',
    change: '-2',
    changeType: 'negative',
    icon: FlagIcon,
  },
]

const recentActivities = [
  {
    user: 'Ahmet K.',
    action: 'yeni hesap oluşturdu',
    time: '5 dakika önce',
  },
  {
    user: 'Mehmet Y.',
    action: 'profilini güncelledi',
    time: '15 dakika önce',
  },
  {
    user: 'Ayşe S.',
    action: 'premium üyelik satın aldı',
    time: '1 saat önce',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Admin Paneli</h2>
        <p className="text-gray-400 mt-1">Site yönetimi ve istatistikler</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <div
            key={stat.name}
            className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-brand-purple" />
              </div>
              <span className={`text-sm ${stat.changeType === 'negative' ? 'text-red-400' : 'text-green-400'}`}>
                {stat.change}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400">{stat.name}</h3>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Son Aktiviteler</h3>
            <button className="text-sm text-brand-purple hover:text-brand-pink transition-colors">
              Tümünü Gör
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                    <UsersIcon className="w-4 h-4 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Hızlı İşlemler</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center gap-2 p-3 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors group">
              <UsersIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Kullanıcı Yönetimi</span>
            </button>

            <button className="w-full flex items-center gap-2 p-3 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors group">
              <Cog6ToothIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Site Ayarları</span>
            </button>

            <button className="w-full flex items-center gap-2 p-3 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors group">
              <BellIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Bildirim Gönder</span>
            </button>

            <button className="w-full flex items-center gap-2 p-3 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors group">
              <FlagIcon className="w-5 h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Raporları İncele</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 