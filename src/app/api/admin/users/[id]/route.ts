import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { getMongoDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { validateUser } from "@/lib/api-middleware"

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  role: z.enum(["USER", "ADMIN", "FOUNDER"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]).optional()
})

// Kullanıcı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      )
    }

    const db = await getMongoDb()

    // İşlem yapan kullanıcıyı bul
    const currentUser = await db.collection("users").findOne(
      { email: token.email }
    )

    if (!currentUser || !["ADMIN", "FOUNDER"].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    // Hedef kullanıcıyı bul
    const targetUser = await db.collection("users").findOne(
      { _id: new ObjectId(params.id) }
    )

    if (!targetUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Admin, başka bir admin veya founder'ı düzenleyemez
    if (currentUser.role === "ADMIN" && (targetUser.role === "FOUNDER" || targetUser.role === "ADMIN")) {
      return NextResponse.json(
        { error: "Bu kullanıcıyı düzenleme yetkiniz yok" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    // Admin, role ve status değiştiremez ve FOUNDER rolüne yükseltemez
    if (currentUser.role === "ADMIN") {
      delete validatedData.role
      delete validatedData.status
    }

    // FOUNDER rolüne sahip kullanıcılar diğer FOUNDER'ları düzenleyemez
    if (currentUser.role === "FOUNDER" && targetUser.role === "FOUNDER" && currentUser._id.toString() !== targetUser._id.toString()) {
      return NextResponse.json(
        { error: "Diğer FOUNDER'ları düzenleme yetkiniz yok" },
        { status: 403 }
      )
    }

    // Email veya username değişiyorsa benzersizlik kontrolü yap
    if (validatedData.email) {
      const existingEmail = await db.collection("users").findOne({
        _id: { $ne: new ObjectId(params.id) },
        email: validatedData.email
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: "Bu email adresi başka bir kullanıcı tarafından kullanılıyor" },
          { status: 400 }
        )
      }
    }

    if (validatedData.username) {
      const existingUsername = await db.collection("users").findOne({
        _id: { $ne: new ObjectId(params.id) },
        username: validatedData.username
      })

      if (existingUsername) {
        return NextResponse.json(
          { error: "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor" },
          { status: 400 }
        )
      }
    }

    // Kullanıcıyı güncelle
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: {
          ...validatedData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Kullanıcı güncellendi"
    })
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

// Kullanıcı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { user: currentUser, token } = validation

    if (!["ADMIN", "FOUNDER"].includes(token.role as string)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const db = await getMongoDb()

    // Silinecek kullanıcıyı bul
    const userToDelete = await db.collection("users").findOne({
      _id: new ObjectId(params.id)
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // FOUNDER kullanıcıları silinemez
    if (userToDelete.role === "FOUNDER") {
      return NextResponse.json(
        { error: "FOUNDER kullanıcıları silinemez" },
        { status: 403 }
      )
    }

    // Admin kullanıcıları sadece FOUNDER silebilir
    if (userToDelete.role === "ADMIN" && token.role !== "FOUNDER") {
      return NextResponse.json(
        { error: "Admin kullanıcıları sadece FOUNDER silebilir" },
        { status: 403 }
      )
    }

    // Kullanıcının link sayfasını bul
    const linkPage = await db.collection("linkPages").findOne({
      userId: userToDelete._id
    })

    // İlişkili tüm verileri sil
    if (linkPage) {
      // Linkleri sil
      await db.collection("links").deleteMany({
        linkPageId: linkPage._id
      })

      // Link sayfasını sil
      await db.collection("linkPages").deleteOne({
        _id: linkPage._id
      })
    }

    // Ziyaret kayıtlarını sil
    await db.collection("visits").deleteMany({
      userId: userToDelete._id
    })

    // Aktivite kayıtlarını sil
    await db.collection("activities").deleteMany({
      userId: userToDelete._id
    })

    // Oturum kayıtlarını sil
    await db.collection("sessions").deleteMany({
      "session.user.email": userToDelete.email
    })

    // Kullanıcıyı sil
    await db.collection("users").deleteOne({
      _id: userToDelete._id
    })

    return NextResponse.json({
      success: true,
      message: "Kullanıcı ve ilişkili tüm veriler silindi"
    })
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 