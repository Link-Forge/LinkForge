'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast, Toaster } from 'react-hot-toast'
import { 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  NoSymbolIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Modal } from '@/components/ui/Modal'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: 'USER' | 'ADMIN' | 'FOUNDER'
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  avatar?: string
  stats: {
    views: number
    uniqueVisitors: number
    links: number
  }
  lastLogin: string | null
  createdAt: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    status: ''
  })

  // Kullanıcıları getir
  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Kullanıcılar getirilemedi')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
      toast.error('Kullanıcılar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Kullanıcı düzenleme
  function handleEdit(user: User) {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status
    })
    setIsEditModalOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return

    const loadingToast = toast.loading('Kullanıcı güncelleniyor...')
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Güncelleme başarısız oldu')
      }

      toast.success('Kullanıcı başarıyla güncellendi', { id: loadingToast })
      setIsEditModalOpen(false)
      fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu', {
        id: loadingToast
      })
    }
  }

  // Kullanıcı silme
  async function handleDelete() {
    if (!selectedUser) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu')
      }

      // Silinen kullanıcı mevcut oturumdaki kullanıcı ise çıkış yap
      if (session?.user?.email === selectedUser.email) {
        signOut({ callbackUrl: '/login' })
        return
      }

      setUsers(users.filter(user => user.id !== selectedUser.id))
      setSelectedUser(null)
      setIsDeleteModalOpen(false)
      toast.success('Kullanıcı başarıyla silindi')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.role || !["ADMIN", "FOUNDER"].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShieldExclamationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-400">Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h2>
          <p className="text-gray-400 mt-1">Tüm kullanıcıları buradan yönetebilirsiniz</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-brand-darker rounded-lg hover:bg-brand-purple/5 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 text-brand-purple" />
            <span className="text-sm text-gray-300">Yenile</span>
          </button>
        </div>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  İstatistikler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    Yükleniyor...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    Henüz hiç kullanıcı yok
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-purple/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name || user.username}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-brand-purple">
                              {(user.name || user.username || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">@{user.username}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        <div>Görüntülenme: {user.stats?.views || 0}</div>
                        <div>Link Sayısı: {user.stats?.links || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-brand-purple/10 text-brand-purple' 
                          : user.role === 'FOUNDER' 
                          ? 'bg-brand-purple/10 text-brand-purple'
                          : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        {user.role === 'ADMIN' && <ShieldCheckIcon className="w-3 h-3" />}
                        {user.role === 'FOUNDER' && <ShieldCheckIcon className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'ACTIVE' 
                          ? 'bg-green-400/10 text-green-400' 
                          : user.status === 'SUSPENDED' 
                          ? 'bg-red-400/10 text-red-400'
                          : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        {user.status === 'ACTIVE' 
                          ? <CheckCircleIcon className="w-3 h-3" />
                          : user.status === 'SUSPENDED'
                          ? <NoSymbolIcon className="w-3 h-3" />
                          : <NoSymbolIcon className="w-3 h-3" />
                        }
                        {user.status === 'ACTIVE' ? 'Aktif' 
                         : user.status === 'SUSPENDED' ? 'Askıya Alındı' 
                         : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString('tr-TR')
                          : 'Hiç giriş yapmadı'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-brand-purple hover:text-brand-pink transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Düzenleme Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Kullanıcı Düzenle"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Ad Soyad
            </label>
            <input
              id="name"
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
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
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
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
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-300">
              Rol
            </label>
            <select
              id="role"
              value={editForm.role}
              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            >
              <option value="USER">Kullanıcı</option>
              <option value="ADMIN">Admin</option>
              <option value="FOUNDER">Founder</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-300">
              Durum
            </label>
            <select
              id="status"
              value={editForm.status}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Askıya Alındı</option>
              <option value="INACTIVE">Pasif</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white text-sm rounded-lg transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </Modal>

      {/* Silme Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Kullanıcı Sil"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            <span className="font-medium text-white">{selectedUser?.name}</span> adlı kullanıcıyı silmek istediğinize emin misiniz?
          </p>
          <p className="text-sm text-gray-400">
            Bu işlem geri alınamaz. Kullanıcının tüm verileri (linkler, istatistikler, vb.) kalıcı olarak silinecektir.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
            >
              Sil
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 