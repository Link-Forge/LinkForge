export const Footer = () => {
  return (
    <footer className="relative mt-32">
      {/* Gradient background that darkens dots */}
      <div className="absolute inset-0 -bottom-32 bg-footer-gradient pointer-events-none" />

      {/* Footer content */}
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-brand-purple text-sm font-medium uppercase tracking-wider">Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/pricing" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/partners" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Partners
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="/docs" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Docs
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-brand-purple text-sm font-medium uppercase tracking-wider">Socials</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  YouTube
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  TikTok
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-brand-purple text-sm font-medium uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            made by{' '}
            <a 
              href="https://parsher.xyz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-purple hover:text-brand-pink transition-colors font-medium"
            >
              parsher
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
} 