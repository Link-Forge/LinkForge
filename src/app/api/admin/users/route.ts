import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getMongoDb } from "@/lib/mongodb"
import { validateUser } from "@/lib/api-middleware"

// Tüm kullanıcıları getir
export async function GET(request: NextRequest) {
  try {
    const validation = await validateUser(request)
    
    if ('error' in validation) {
      if (validation.redirect) {
        return NextResponse.redirect(new URL(validation.redirect, request.url))
      }
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { user, token } = validation

    if (!["ADMIN", "FOUNDER"].includes(token.role as string)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const db = await getMongoDb()

    // Tüm kullanıcıları getir
    const users = await db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Kullanıcı verilerini düzenle
    const formattedUsers = await Promise.all(users.map(async (user) => {
      // Link sayfasını bul
      const linkPage = await db.collection("linkPages").findOne({ userId: user._id })
      
      // Son ziyareti bul
      const lastVisit = await db.collection("visits")
        .findOne(
          { userId: user._id },
          { sort: { createdAt: -1 } }
        )

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        avatar: linkPage?.avatar,
        stats: {
          views: linkPage?.viewCount || 0,
          uniqueVisitors: linkPage?.uniqueVisitors || 0,
          links: await db.collection("links").countDocuments({ linkPageId: linkPage?._id })
        },
        lastLogin: lastVisit?.createdAt || null,
        createdAt: user.createdAt
      }
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Kullanıcı listesi getirme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 