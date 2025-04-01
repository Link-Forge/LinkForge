export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Auth Container */}
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-purple">
            LinkForge
          </h1>
        </div>

        {/* Content */}
        <div className="bg-brand-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 