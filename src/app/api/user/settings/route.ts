import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import * as z from "zod"

// Profil güncelleme şeması
const profileSchema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  avatar: z.string().url().optional(),
})

// Şifre güncelleme şeması
const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

const userSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  notifications: z.object({
    email: z.object({
      followers: z.boolean().optional(),
      clicks: z.boolean().optional(),
      security: z.boolean().optional()
    }).optional()
  }).optional(),
  visibility: z.enum(['public', 'followers', 'private']).optional()
})

// Kullanıcı bilgilerini getir
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
      { email: token.email },
      { projection: { password: 0 } }
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

    return NextResponse.json({
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: linkPage?.avatar || '',
      notifications: user.notifications,
      visibility: user.visibility
    })
  } catch (error) {
    console.error("Ayarlar getirme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Kullanıcı bilgilerini güncelle
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
    const { type, data } = body

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ email: token.email })
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    if (type === 'profile') {
      // Kullanıcı bilgilerini güncelle
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            username: data.username,
            email: data.email,
            bio: data.bio,
            updatedAt: new Date()
          }
        }
      )

      // Link sayfasını güncelle
      await db.collection("linkPages").updateOne(
        { userId: user._id },
        {
          $set: {
            avatar: data.avatar,
            updatedAt: new Date()
          }
        }
      )

      // Session'ı güncelle
      const session = await getToken({ req: request })
      if (session) {
        session.avatar = data.avatar
      }

      return NextResponse.json({
        message: "Profil güncellendi"
      })
    }

    // Şifre güncelleme
    if (type === "password") {
      const data = passwordSchema.parse(body.data)

      const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mevcut şifre yanlış" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10)

      await db.collection("users").updateOne(
        { email: token.email },
        { 
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json({
        message: "Şifre güncellendi"
      })
    }

    return NextResponse.json(
      { error: "Geçersiz işlem" },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Kullanıcı güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Hesap silme
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      )
    }

    const db = await clientPromise

    // Kullanıcıyı bul
    const user = await db.db().collection("users").findOne(
      { email: token.email }
    )

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Link sayfasını bul
    const linkPage = await db.db().collection("linkPages").findOne({
      userId: user._id
    })

    // İlişkili verileri sil
    if (linkPage) {
      // Linkleri sil
      await db.db().collection("links").deleteMany({
        linkPageId: linkPage._id
      })

      // Link sayfasını sil
      await db.db().collection("linkPages").deleteOne({
        _id: linkPage._id
      })
    }

    // Ziyaret kayıtlarını sil
    await db.db().collection("visits").deleteMany({
      userId: user._id
    })

    // Aktivite kayıtlarını sil
    await db.db().collection("activities").deleteMany({
      userId: user._id
    })

    // Kullanıcıyı sil
    await db.db().collection("users").deleteOne({
      _id: user._id
    })

    return NextResponse.json({
      message: "Hesabınız ve tüm verileriniz başarıyla silindi"
    })
  } catch (error) {
    console.error("Hesap silme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 