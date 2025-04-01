'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { toast, Toaster } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { debounce } from 'lodash'
import { HexColorPicker } from 'react-colorful'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon, ArrowPathIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline'

const designSchema = z.object({
  theme: z.string(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir HEX renk kodu girin'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir HEX renk kodu girin'),
  font: z.string(),
  buttonStyle: z.string(),
  buttonColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir HEX renk kodu girin'),
  buttonTextColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir HEX renk kodu girin'),
  animation: z.string(),
  backgroundPattern: z.string(),
  customCss: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional()
})

type DesignSettings = z.infer<typeof designSchema>

const ColorPickerModal = ({ isOpen, onClose, color, onChange, title }: {
  isOpen: boolean
  onClose: () => void
  color: string
  onChange: (color: string) => void
  title: string
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="p-4">
      <HexColorPicker color={color} onChange={onChange} />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="mt-4 w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100"
      />
    </div>
  </Modal>
)

export default function DesignPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DesignSettings>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      font: 'Inter',
      buttonStyle: 'solid',
      buttonColor: '#865DFF',
      buttonTextColor: '#ffffff',
      backgroundPattern: 'none',
      animation: 'none',
      theme: 'default'
    }
  })

  const settings = watch()

  useEffect(() => {
    // Mevcut ayarları yükle
    const loadSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/design')
        const data = await response.json()
        if (data.success) {
          Object.entries(data.settings).forEach(([key, value]) => {
            setValue(key as keyof DesignSettings, value)
          })
        }
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error)
        toast.error('Ayarlar yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [setValue])

  const debouncedSave = useMemo(
    () =>
      debounce(async (data: DesignSettings) => {
        try {
          const response = await fetch('/api/user/design', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          const result = await response.json()
          if (result.success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }
        } catch (error) {
          console.error('Ayarlar kaydedilirken hata oluştu:', error)
          toast.error('Ayarlar kaydedilemedi')
        }
      }, 500),
    []
  )

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      debouncedSave(settings)
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [settings, debouncedSave])

  const onSubmit = async (data: DesignSettings) => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/design', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Ayarlar kaydedildi')
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error)
      toast.error('Ayarlar kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasarım</h2>
          <p className="text-gray-400 mt-1">Profilinin görünümünü özelleştir</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Panel - Ayarlar */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-6 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg space-y-6">
              {/* Renkler */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Renkler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Arka Plan Rengi
                    </label>
                    <button
                      type="button"
                      onClick={() => setColorPickerOpen('backgroundColor')}
                      className="w-full h-10 rounded border border-gray-800 cursor-pointer"
                      style={{ backgroundColor: settings.backgroundColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Metin Rengi
                    </label>
                    <button
                      type="button"
                      onClick={() => setColorPickerOpen('textColor')}
                      className="w-full h-10 rounded border border-gray-800 cursor-pointer"
                      style={{ backgroundColor: settings.textColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Tipografi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Tipografi</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Ailesi
                  </label>
                  <select
                    {...register('font')}
                    className="w-full p-2 rounded-lg bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Fira Code">Fira Code</option>
                  </select>
                </div>
              </div>

              {/* Buton Stilleri */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Buton Stilleri</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Buton Stili
                    </label>
                    <select
                      {...register('buttonStyle')}
                      className="w-full p-2 rounded-lg bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent"
                    >
                      <option value="solid">Solid</option>
                      <option value="outline">Outline</option>
                      <option value="soft">Soft</option>
                      <option value="glass">Glass</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Buton Rengi
                    </label>
                    <button
                      type="button"
                      onClick={() => setColorPickerOpen('buttonColor')}
                      className="w-full h-10 rounded border border-gray-800 cursor-pointer"
                      style={{ backgroundColor: settings.buttonColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Buton Metin Rengi
                    </label>
                    <button
                      type="button"
                      onClick={() => setColorPickerOpen('buttonTextColor')}
                      className="w-full h-10 rounded border border-gray-800 cursor-pointer"
                      style={{ backgroundColor: settings.buttonTextColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Animasyonlar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Animasyonlar</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Buton Animasyonu
                  </label>
                  <select
                    {...register('animation')}
                    className="w-full p-2 rounded-lg bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent"
                  >
                    <option value="none">Yok</option>
                    <option value="fade">Fade</option>
                    <option value="scale">Scale</option>
                    <option value="slide">Slide</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>
              </div>

              {/* Arka Plan Desenleri */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Arka Plan Deseni</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Desen Seçimi
                  </label>
                  <select
                    {...register('backgroundPattern')}
                    className="w-full p-2 rounded-lg bg-brand-darker border border-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent"
                  >
                    <option value="none">Yok</option>
                    <option value="dots">Noktalar</option>
                    <option value="grid">Izgara</option>
                    <option value="waves">Dalgalar</option>
                    <option value="circles">Daireler</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <SparklesIcon className="w-5 h-5" />
              )}
              {loading ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
            </button>
      </form>
        </div>

        {/* Sağ Panel - Önizleme */}
        <div className="sticky top-8">
          <div
            className="min-h-[600px] p-8 bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg overflow-hidden"
            style={{
              backgroundColor: settings.backgroundColor,
              color: settings.textColor,
              fontFamily: settings.font,
              backgroundImage:
                settings.backgroundPattern === 'dots'
                  ? `radial-gradient(circle at 1px 1px, ${settings.textColor}22 1px, transparent 0)`
                  : settings.backgroundPattern === 'grid'
                  ? `linear-gradient(${settings.textColor}22 1px, transparent 1px),
                     linear-gradient(90deg, ${settings.textColor}22 1px, transparent 1px)`
                  : settings.backgroundPattern === 'waves'
                  ? `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(
                      settings.textColor
                    )}' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                  : settings.backgroundPattern === 'circles'
                  ? `radial-gradient(circle at 50% 50%, ${settings.textColor}11 25%, transparent 25.5%, transparent 47%, ${settings.textColor}11 47.5%, ${settings.textColor}11 52.5%, transparent 53%, transparent 74.5%, ${settings.textColor}11 75%)`
                  : 'none',
              backgroundSize:
                settings.backgroundPattern === 'dots'
                  ? '32px 32px'
                  : settings.backgroundPattern === 'grid'
                  ? '32px 32px'
                  : settings.backgroundPattern === 'waves'
                  ? '100px 20px'
                  : settings.backgroundPattern === 'circles'
                  ? '100px 100px'
                  : 'auto',
            }}
          >
            {/* Profil Bilgileri */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-800">
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {session?.user?.username?.[0].toUpperCase()}
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">@{session?.user?.username}</h1>
              <p className="text-sm opacity-80">Profil açıklaması burada yer alacak</p>
            </div>

            {/* Örnek Linkler */}
            <div className="space-y-4 max-w-md mx-auto">
              {['Link 1', 'Link 2', 'Link 3'].map((link, index) => (
                <button
                  key={index}
                  className={`w-full p-4 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    settings.buttonStyle === 'outline'
                      ? `border-2 border-[${settings.buttonColor}] text-[${settings.buttonColor}] hover:bg-[${settings.buttonColor}] hover:text-[${settings.buttonTextColor}]`
                      : settings.buttonStyle === 'soft'
                      ? `bg-[${settings.buttonColor}]/10 text-[${settings.buttonColor}] hover:bg-[${settings.buttonColor}]/20`
                      : settings.buttonStyle === 'glass'
                      ? `backdrop-blur-md bg-[${settings.buttonColor}]/20 text-[${settings.buttonColor}] hover:bg-[${settings.buttonColor}]/30 border border-[${settings.buttonColor}]/20`
                      : settings.buttonStyle === 'minimal'
                      ? `text-[${settings.buttonColor}] hover:bg-[${settings.buttonColor}]/10`
                      : `bg-[${settings.buttonColor}] text-[${settings.buttonTextColor}] hover:opacity-90`
                  } ${
                    settings.animation === 'fade'
                      ? 'hover:opacity-80'
                      : settings.animation === 'scale'
                      ? 'hover:scale-[1.02]'
                      : settings.animation === 'slide'
                      ? 'hover:translate-x-1'
                      : settings.animation === 'bounce'
                      ? 'hover:animate-bounce'
                      : ''
                  }`}
                  style={{
                    backgroundColor: settings.buttonStyle === 'solid' ? settings.buttonColor : 'transparent',
                    color: settings.buttonStyle === 'solid' ? settings.buttonTextColor : settings.buttonColor,
                    borderColor: settings.buttonStyle === 'outline' ? settings.buttonColor : 'transparent'
                  }}
                >
                  {link}
                </button>
              ))}
            </div>

            {/* Önizleme Bilgisi */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <p className="text-xs opacity-50">Önizleme</p>
            </div>
          </div>
        </div>
      </div>

      {/* Renk Seçici Modalları */}
      <ColorPickerModal
        isOpen={colorPickerOpen === 'backgroundColor'}
        onClose={() => setColorPickerOpen(null)}
        color={settings.backgroundColor}
        onChange={(color) => setValue('backgroundColor', color)}
        title="Arka Plan Rengi"
      />
      <ColorPickerModal
        isOpen={colorPickerOpen === 'textColor'}
        onClose={() => setColorPickerOpen(null)}
        color={settings.textColor}
        onChange={(color) => setValue('textColor', color)}
        title="Metin Rengi"
      />
      <ColorPickerModal
        isOpen={colorPickerOpen === 'buttonColor'}
        onClose={() => setColorPickerOpen(null)}
        color={settings.buttonColor}
        onChange={(color) => setValue('buttonColor', color)}
        title="Buton Rengi"
      />
      <ColorPickerModal
        isOpen={colorPickerOpen === 'buttonTextColor'}
        onClose={() => setColorPickerOpen(null)}
        color={settings.buttonTextColor}
        onChange={(color) => setValue('buttonTextColor', color)}
        title="Buton Metin Rengi"
      />

      <Toaster position="top-right" />
    </div>
  )
}