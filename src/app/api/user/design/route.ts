import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import * as z from "zod"

// Tasarım ayarları şeması
const designSchema = z.object({
  theme: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  font: z.string(),
  buttonStyle: z.string(),
  buttonColor: z.string(),
  buttonTextColor: z.string(),
  animation: z.string(),
  backgroundPattern: z.string(),
  customCss: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional()
})

// Tasarım ayarlarını getir
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

    return NextResponse.json({
      theme: linkPage.theme || 'default',
      backgroundColor: linkPage.backgroundColor || '#050505',
      textColor: linkPage.textColor || '#ffffff',
      font: linkPage.font || 'Inter, sans-serif',
      buttonStyle: linkPage.buttonStyle || 'solid',
      buttonColor: linkPage.buttonColor || '#865DFF',
      buttonTextColor: linkPage.buttonTextColor || '#ffffff',
      animation: linkPage.animation || 'none',
      backgroundPattern: linkPage.backgroundPattern || 'none',
      customCss: linkPage.customCss,
      title: linkPage.title,
      description: linkPage.description,
      avatar: linkPage.avatar
    })
  } catch (error) {
    console.error("Tasarım ayarları getirme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Tasarım ayarlarını güncelle
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
    const validatedData = designSchema.parse(body)

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

    // Link sayfasını güncelle
    const result = await db.collection("linkPages").updateOne(
      { userId: user._id },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Link sayfası bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Tasarım ayarları güncellendi"
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Tasarım ayarları güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 