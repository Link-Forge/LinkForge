import { Metadata } from 'next'
import { getMongoDb } from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import { LinkPageClient } from './LinkPageClient'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface LinkPageProps {
  params: {
    username: string
  }
}

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

export async function generateMetadata({ params }: LinkPageProps): Promise<Metadata> {
  const db = await getMongoDb()

  const user = await db.collection('users').findOne(
    { username: params.username }
  )

  if (!user) {
    return {
      title: 'Sayfa Bulunamadı | LinkForge',
      description: 'Aradığınız sayfa bulunamadı.'
    }
  }

  const linkPage = await db.collection('linkPages').findOne(
    { userId: user._id }
  )

  const metadata: Metadata = {
    title: `${user.name || params.username} | LinkForge`,
    description: linkPage?.description || `${params.username}'in link sayfası`,
    openGraph: {
      title: `${user.name || params.username} | LinkForge`,
      description: linkPage?.description || `${params.username}'in link sayfası`,
      images: [linkPage?.avatar || '/default-avatar.png'],
      type: 'profile',
      profile: {
        username: params.username
      }
    },
    twitter: {
      card: 'summary',
      title: `${user.name || params.username} | LinkForge`,
      description: linkPage?.description || `${params.username}'in link sayfası`,
      images: [linkPage?.avatar || '/default-avatar.png'],
      creator: `@${params.username}`
    }
  }

  return metadata
}

export default async function LinkPage({ params }: LinkPageProps) {
  return (
    <ErrorBoundary fallback={<div>Bir şeyler yanlış gitti. Lütfen sayfayı yenileyin.</div>}>
      <Suspense fallback={<LoadingSpinner />}>
        <LinkPageContent params={params} />
      </Suspense>
    </ErrorBoundary>
  )
}

async function LinkPageContent({ params }: LinkPageProps) {
  const db = await getMongoDb()

  // Kullanıcıyı bul
  const user = await db.collection('users').findOne(
    { username: params.username }
  )

  if (!user) {
    notFound()
  }

  // Link sayfasını bul
  const linkPage = await db.collection('linkPages').findOne(
    { userId: user._id }
  )

  if (!linkPage) {
    notFound()
  }

  // Linkleri getir
  const links = await db.collection('links')
    .find({ linkPageId: linkPage._id, isActive: true })
    .sort({ order: 1 })
    .toArray()

  const pageData: LinkPage = {
    backgroundColor: linkPage.backgroundColor || '#050505',
    textColor: linkPage.textColor || '#ffffff',
    font: linkPage.font || 'Inter, sans-serif',
    buttonStyle: linkPage.buttonStyle || 'solid',
    buttonColor: linkPage.buttonColor || '#865DFF',
    buttonTextColor: linkPage.buttonTextColor || '#ffffff',
    animation: linkPage.animation || 'none',
    backgroundPattern: linkPage.backgroundPattern || 'none',
    title: linkPage.title,
    description: linkPage.description,
    avatar: linkPage.avatar,
    links: links.map(link => ({
      _id: link._id.toString(),
      title: link.title,
      url: link.url,
      icon: link.icon,
      clickCount: link.clickCount
    }))
  }

  return <LinkPageClient 
    data={pageData} 
    username={params.username} 
    userId={user._id.toString()} 
  />
} 