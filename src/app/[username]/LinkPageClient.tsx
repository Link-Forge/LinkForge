'use client'

import Image from 'next/image'
import { useEffect, useCallback, memo } from 'react'
import Cookies from 'js-cookie'
import { toast } from 'react-hot-toast'

interface Link {
  _id: string
  title: string
  url: string
  icon?: string
  clickCount: number
}

interface LinkPage {
  backgroundColor: string
  textColor: string
  font: string
  buttonStyle: string
  buttonColor: string
  buttonTextColor: string
  animation: string
  backgroundPattern: string
  title?: string
  description?: string
  avatar?: string
  links: Link[]
}

interface LinkPageClientProps {
  data: LinkPage
  username: string
  userId: string
}

const LinkButton = memo(({ link, buttonStyle, buttonColor, buttonTextColor, animation, handleClick }: {
  link: Link
  buttonStyle: string
  buttonColor: string
  buttonTextColor: string
  animation: string
  handleClick: (id: string) => Promise<void>
}) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full p-4 rounded-lg transition-all duration-200 flex items-center gap-3 ${
        buttonStyle === 'outline'
          ? `border-2 border-[${buttonColor}] text-[${buttonColor}] hover:bg-[${buttonColor}] hover:text-white`
          : buttonStyle === 'soft'
          ? `bg-[${buttonColor}]/10 text-[${buttonColor}] hover:bg-[${buttonColor}]/20`
          : buttonStyle === 'glass'
          ? `backdrop-blur-md bg-[${buttonColor}]/20 text-[${buttonColor}] hover:bg-[${buttonColor}]/30 border border-[${buttonColor}]/20`
          : buttonStyle === 'minimal'
          ? `text-[${buttonColor}] hover:bg-[${buttonColor}]/10`
          : `bg-[${buttonColor}] text-[${buttonTextColor}] hover:opacity-90`
      } ${
        animation === 'fade'
          ? 'hover:opacity-80'
          : animation === 'scale'
          ? 'hover:scale-[1.02]'
          : animation === 'slide'
          ? 'hover:translate-x-1'
          : animation === 'bounce'
          ? 'hover:animate-bounce'
          : ''
      }`}
      onClick={(e) => {
        e.preventDefault()
        handleClick(link._id)
        window.open(link.url, '_blank')
      }}
    >
      {link.icon && (
        <div className="w-6 h-6 relative flex-shrink-0">
          <Image
            src={link.icon}
            alt=""
            width={24}
            height={24}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <span>{link.title}</span>
    </a>
  )
})

LinkButton.displayName = 'LinkButton'

export function LinkPageClient({ data, username, userId }: LinkPageClientProps) {
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const visitorId = Cookies.get('visitor_id')
        const response = await fetch('/api/user/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            visitorId
          })
        })

        const result = await response.json()
        if (result.success && result.visitorId) {
          Cookies.set('visitor_id', result.visitorId, { expires: 365 })
        }
      } catch (error) {
        console.error('Ziyaret kaydedilemedi:', error)
      }
    }

    recordVisit()
  }, [userId])

  const handleLinkClick = useCallback(async (linkId: string) => {
    try {
      await fetch(`/api/links/${linkId}/click`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Link tıklama hatası:', error)
      toast.error('Link tıklama kaydedilemedi')
    }
  }, [])

  const style = {
    backgroundColor: data.backgroundColor,
    color: data.textColor,
    fontFamily: data.font,
    backgroundImage:
      data.backgroundPattern === 'dots'
        ? `radial-gradient(circle at 1px 1px, ${data.textColor}22 1px, transparent 0)`
        : data.backgroundPattern === 'grid'
        ? `linear-gradient(${data.textColor}22 1px, transparent 1px),
           linear-gradient(90deg, ${data.textColor}22 1px, transparent 1px)`
        : data.backgroundPattern === 'waves'
        ? `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(
            data.textColor
          )}' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
        : data.backgroundPattern === 'circles'
        ? `radial-gradient(circle at 50% 50%, ${data.textColor}11 25%, transparent 25.5%, transparent 47%, ${data.textColor}11 47.5%, ${data.textColor}11 52.5%, transparent 53%, transparent 74.5%, ${data.textColor}11 75%)`
        : 'none',
    backgroundSize:
      data.backgroundPattern === 'dots'
        ? '32px 32px'
        : data.backgroundPattern === 'grid'
        ? '32px 32px'
        : data.backgroundPattern === 'waves'
        ? '100px 20px'
        : data.backgroundPattern === 'circles'
        ? '100px 100px'
        : 'auto',
  }

  return (
    <div className="min-h-screen p-8" style={style}>
      {/* Profil Bilgileri */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-800">
          {data.avatar ? (
            <Image
              src={data.avatar}
              alt={`${username}'in profil fotoğrafı`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {username[0].toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">@{username}</h1>
        {data.description && (
          <p className="text-sm opacity-80">{data.description}</p>
        )}
      </div>

      {/* Linkler */}
      <div className="space-y-4 max-w-lg mx-auto">
        {data.links.map((link) => (
          <LinkButton
            key={link._id}
            link={link}
            buttonStyle={data.buttonStyle}
            buttonColor={data.buttonColor}
            buttonTextColor={data.buttonTextColor}
            animation={data.animation}
            handleClick={handleLinkClick}
          />
        ))}
      </div>
    </div>
  )
} 