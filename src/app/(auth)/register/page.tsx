'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const passwordConfirmation = formData.get('password_confirmation') as string

    if (password !== passwordConfirmation) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      router.push('/login?registered=true')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Hesap Oluştur</h2>
        <p className="text-sm text-gray-400">
          Hemen ücretsiz hesabınızı oluşturun
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-300">
            Kullanıcı Adı
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="kullaniciadi"
            required
            className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="ornek@email.com"
            required
            className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-300">
            Şifre Tekrar
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 rounded border-gray-800 bg-brand-darker text-brand-purple focus:ring-brand-purple/50"
          />
          <label htmlFor="terms" className="text-sm text-gray-400">
            <span>Kabul ediyorum </span>
            <Link href="/terms" className="text-brand-purple hover:text-brand-pink transition-colors">
              Kullanım Şartları
            </Link>
            <span> ve </span>
            <Link href="/privacy" className="text-brand-purple hover:text-brand-pink transition-colors">
              Gizlilik Politikası
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-md bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-colors animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Zaten hesabınız var mı?{' '}
          <Link 
            href="/login"
            className="text-brand-purple hover:text-brand-pink transition-colors font-medium"
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
} 