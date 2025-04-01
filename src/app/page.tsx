import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 to-transparent dark:from-brand-purple/10" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-light bg-clip-text text-transparent animate-pulse-slow">
              Modern Link Yönetim Platformu
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Discord kullanıcıları ve gamerlar için özelleştirilebilir, modern ve havalı link sayfanızı oluşturun.
              Tüm sosyal medya hesaplarınızı tek bir yerde toplayın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                Hemen Başla
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-3 rounded-lg border border-brand-purple text-brand-purple hover:bg-brand-purple/10 font-medium transition-colors"
              >
                Özellikler
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-block px-3 py-1 rounded bg-brand-purple/10 text-brand-purple text-sm font-medium mb-6">
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Built for you
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you expect from a biolink tool—only better, and completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-gray-800/50 bg-brand-darker/50 hover:border-brand-purple/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4 group-hover:bg-brand-purple/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 border-y border-gray-800/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500">
            Trusted by <span className="text-brand-purple font-medium">70,585 users</span> to streamline their digital presence
          </p>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Ready to get started?
            </h2>
            <p className="text-gray-400 text-lg mb-12">
              Create your free account today and start building your bio page.
            </p>
            <Link
              href="/register"
              className="inline-flex px-8 py-4 rounded bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-colors animate-glow"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const features = [
  {
    title: 'Widgets',
    description: 'Add custom or embedded widgets from Discord, Steam, Roblox, Spotify, and more.',
    icon: (props: IconProps) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Music Player',
    description: 'Seamlessly add and customize a music player with your favorite tracks to personalize your biolink experience.',
    icon: (props: IconProps) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: 'Templates',
    description: 'Explore and share community-made templates to quickly set up a stylish and unique biolink.',
    icon: (props: IconProps) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
]
