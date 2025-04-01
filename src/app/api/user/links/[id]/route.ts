import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { z } from "zod"

// Link güncelleme şeması
const linkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional()
})

// Link güncelle
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

    const body = await request.json()
    const data = linkSchema.parse(body)

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

    // Linki güncelle
    const result = await db.collection("links").findOneAndUpdate(
      {
        _id: new ObjectId(params.id),
        linkPageId: linkPage._id
      },
      {
        $set: {
          ...data,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: "Link bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Link güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Link sil
export async function DELETE(
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

    // Linki sil
    const result = await db.collection("links").deleteOne({
      _id: new ObjectId(params.id),
      linkPageId: linkPage._id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Link bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Link silme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 