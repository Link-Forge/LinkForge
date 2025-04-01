import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Kullanıcıyı bul
    const user = await db.collection("users").findOne(
      { email: token.email }
    )

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Link sayfasını bul
    const linkPage = await db.collection("linkPages").findOne(
      { userId: user._id }
    )

    if (!linkPage) {
      return NextResponse.json(
        { error: "Link sayfası bulunamadı" },
        { status: 404 }
      )
    }

    // Aktif linkleri say
    const activeLinksCount = await db.collection("links").countDocuments({
      linkPageId: linkPage._id,
      isActive: true
    })

    // Toplam tıklanma sayısını hesapla
    const links = await db.collection("links")
      .find({ linkPageId: linkPage._id })
      .toArray()

    const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0)

    // Son aktiviteleri getir
    const recentActivities = await db.collection("activities")
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // İstatistikleri hesapla
    const stats = {
      viewCount: linkPage.viewCount || 0,
      activeLinks: activeLinksCount,
      totalClicks: totalClicks,
      recentActivities: recentActivities.map(activity => ({
        type: activity.type,
        details: activity.details,
        createdAt: activity.createdAt
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("İstatistik getirme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 