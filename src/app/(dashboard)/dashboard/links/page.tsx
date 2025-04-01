'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'

interface Link {
  _id: string
  title: string
  url: string
  description?: string
  icon?: string
  order: number
  isActive: boolean
  clickCount: number
  linkPageId: string
  createdAt: string
  updatedAt: string
}

interface LinkPage {
  _id: string
  userId: string
  title: string
  description?: string
  theme: string
  backgroundColor?: string
  textColor?: string
  font?: string
  isPublic: boolean
  viewCount: number
  links: Link[]
  createdAt: string
  updatedAt: string
}

export default function LinksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkPage, setLinkPage] = useState<LinkPage | null>(null)
  const [showAddLink, setShowAddLink] = useState(false)
  const [showEditLink, setShowEditLink] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    icon: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)

  useEffect(() => {
    fetchLinkPage()
  }, [])

  async function fetchLinkPage() {
    try {
      const response = await fetch('/api/user/links')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setLinkPage(data)
    } catch (error) {
      setError('Link sayfası yüklenirken bir hata oluştu')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/user/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLink)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setLinkPage(prev => ({
        ...prev!,
        links: [...prev!.links, data]
      }))
      setShowAddLink(false)
      setNewLink({ title: '', url: '', description: '', icon: '' })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditLink(e: React.FormEvent) {
    e.preventDefault()
    if (!editingLink) return

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/user/links/${editingLink._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingLink.title,
          url: editingLink.url,
          description: editingLink.description,
          icon: editingLink.icon
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setLinkPage(prev => ({
        ...prev!,
        links: prev!.links.map(link => 
          link._id === editingLink._id ? { ...link, ...data } : link
        )
      }))
      setShowEditLink(false)
      setEditingLink(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteLink() {
    if (!deletingLinkId) return

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/user/links/${deletingLinkId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setLinkPage(prev => ({
        ...prev!,
        links: prev!.links.filter(link => link._id !== deletingLinkId)
      }))
      setShowDeleteModal(false)
      setDeletingLinkId(null)
      toast.success('Link başarıyla silindi')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function handleMoveLink(linkId: string, direction: 'up' | 'down') {
    try {
      setLoading(true)
      const currentLinks = linkPage?.links || []
      const currentIndex = currentLinks.findIndex(link => link._id === linkId)
      
      if (currentIndex === -1) return
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= currentLinks.length) return
      
      const reorderedLinks = [...currentLinks]
      const temp = reorderedLinks[currentIndex]
      reorderedLinks[currentIndex] = reorderedLinks[newIndex]
      reorderedLinks[newIndex] = temp
      
      const linksWithNewOrder = reorderedLinks.map((link, index) => ({
        _id: link._id,
        order: index
      }))

      const response = await fetch('/api/user/links/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: linksWithNewOrder })
      })

      if (!response.ok) {
        throw new Error('Sıralama güncellenemedi')
      }

      await fetchLinkPage()
      toast.success('Sıralama güncellendi')
    } catch (error) {
      console.error('Sıralama hatası:', error)
      toast.error('Sıralama güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
          <h2 className="text-2xl font-bold text-white">Linkler</h2>
          <p className="text-gray-400 mt-1">Linklerini buradan yönetebilirsin</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${session?.user?.username}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors group"
          >
            <span>Profilimi Görüntüle</span>
            <ArrowTopRightOnSquareIcon className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <button
            onClick={() => setShowAddLink(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Yeni Link</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {showAddLink && (
        <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Yeni Link Ekle</h3>
            <button
              onClick={() => setShowAddLink(false)}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleAddLink} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Başlık
              </label>
              <input
                type="text"
                value={newLink.title}
                onChange={e => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                URL
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={e => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Açıklama (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={newLink.description}
                onChange={e => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                İkon (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={newLink.icon}
                onChange={e => setNewLink(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddLink(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditLink}
        onClose={() => {
          setShowEditLink(false)
          setEditingLink(null)
        }}
        title="Link Düzenle"
      >
        <form onSubmit={handleEditLink} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Başlık
            </label>
            <input
              type="text"
              value={editingLink?.title || ''}
              onChange={e => setEditingLink(prev => ({ ...prev!, title: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              URL
            </label>
            <input
              type="url"
              value={editingLink?.url || ''}
              onChange={e => setEditingLink(prev => ({ ...prev!, url: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Açıklama (İsteğe bağlı)
            </label>
            <input
              type="text"
              value={editingLink?.description || ''}
              onChange={e => setEditingLink(prev => ({ ...prev!, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              İkon (İsteğe bağlı)
            </label>
            <input
              type="text"
              value={editingLink?.icon || ''}
              onChange={e => setEditingLink(prev => ({ ...prev!, icon: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditLink(false)
                setEditingLink(null)
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingLinkId(null)
        }}
        title="Link Sil"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Bu linki silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDeleteLink}
              disabled={loading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Siliniyor...' : 'Sil'}
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setDeletingLinkId(null)
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      </Modal>

      <div className="space-y-4">
        {linkPage?.links.map((link, index) => (
          <div
            key={link._id}
            className="p-4 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleMoveLink(link._id, 'up')}
                  disabled={index === 0 || loading}
                  className="p-1 text-gray-400 hover:text-brand-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUpIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleMoveLink(link._id, 'down')}
                  disabled={index === linkPage.links.length - 1 || loading}
                  className="p-1 text-gray-400 hover:text-brand-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-white">{link.title}</h3>
                <p className="text-sm text-gray-400">{link.url}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingLink(link)
                  setShowEditLink(true)
                }}
                className="p-2 text-gray-400 hover:text-brand-purple transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setDeletingLinkId(link._id)
                  setShowDeleteModal(true)
                }}
                className="p-2 text-red-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {linkPage?.links.length === 0 && (
        <div className="text-center py-12 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg">
          <p className="text-gray-400">Henüz hiç link eklenmemiş</p>
          <button
            onClick={() => setShowAddLink(true)}
            className="mt-4 px-4 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple rounded-lg transition-colors text-sm"
          >
            İlk Linkini Ekle
          </button>
        </div>
      )}
    </div>
  )
} 