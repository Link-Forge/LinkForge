import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { z } from "zod"

// Link sıralama şeması
const reorderSchema = z.object({
  links: z.array(z.object({
    _id: z.string(),
    order: z.number()
  }))
})

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
    const { links } = reorderSchema.parse(body)

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

    // Linklerin sıralamasını güncelle
    const operations = links.map(({ _id, order }) => ({
      updateOne: {
        filter: {
          _id: new ObjectId(_id),
          linkPageId: linkPage._id
        },
        update: {
          $set: { order }
        }
      }
    }))

    await db.collection("links").bulkWrite(operations)

    // Güncellenmiş linkleri getir
    const updatedLinks = await db.collection("links")
      .find({ linkPageId: linkPage._id })
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      links: updatedLinks
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Link sıralama hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 