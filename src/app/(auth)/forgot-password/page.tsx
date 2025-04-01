import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Şifremi Unuttum</h2>
        <p className="text-sm text-gray-400">
          Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            className="w-full px-3 py-2 rounded-md bg-brand-darker border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-md bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-colors animate-glow"
        >
          Sıfırlama Bağlantısı Gönder
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          <Link 
            href="/login"
            className="text-brand-purple hover:text-brand-pink transition-colors font-medium"
          >
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  )
} 