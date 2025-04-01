import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { getMongoDb } from "@/lib/mongodb"
import { z } from "zod"

const profileSchema = z.object({
  description: z.string(),
  avatar: z.string().optional()
})

// Profil ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      )
    }

    const db = await getMongoDb()

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

    return NextResponse.json({
      description: linkPage.description || '',
      avatar: linkPage.avatar || ''
    })
  } catch (error) {
    console.error("Profil bilgileri getirme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Profil ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = profileSchema.parse(body)

    const db = await getMongoDb()

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

    // Link sayfasını güncelle
    const result = await db.collection("linkPages").updateOne(
      { userId: user._id },
      { 
        $set: {
          description: data.description,
          avatar: data.avatar,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      // Link sayfası bulunamadıysa yeni bir tane oluştur
      await db.collection("linkPages").insertOne({
        userId: user._id,
        description: data.description,
        avatar: data.avatar,
        theme: "default",
        backgroundColor: "#050505",
        textColor: "#ffffff",
        font: "Inter, sans-serif",
        buttonStyle: "solid",
        buttonColor: "#865DFF",
        buttonTextColor: "#ffffff",
        animation: "none",
        backgroundPattern: "none",
        isPublic: true,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      message: "Profil güncellendi",
      data: {
        description: data.description,
        avatar: data.avatar
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Profil güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 