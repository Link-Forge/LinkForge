import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { z } from "zod"

// Link ekleme şeması
const linkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional()
})

// Link sayfası ve linkleri getir
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
      // Link sayfası yoksa oluştur
      const newLinkPage = await db.collection("linkPages").insertOne({
        userId: user._id,
        title: `${user.name}'in Link Sayfası`,
        description: "Benim linklerim",
        theme: "default",
        backgroundColor: "#000000",
        textColor: "#ffffff",
        font: "Inter, sans-serif",
        isPublic: true,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json({
        _id: newLinkPage.insertedId,
        userId: user._id,
        title: `${user.name}'in Link Sayfası`,
        description: "Benim linklerim",
        theme: "default",
        backgroundColor: "#000000",
        textColor: "#ffffff",
        font: "Inter, sans-serif",
        isPublic: true,
        viewCount: 0,
        links: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Linkleri bul
    const links = await db.collection("links")
      .find({ linkPageId: linkPage._id })
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({
      ...linkPage,
      links
    })
  } catch (error) {
    console.error("Link sayfası getirme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Yeni link ekle
export async function POST(request: NextRequest) {
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

    // Mevcut en yüksek sıra numarasını bul
    const maxOrderLink = await db.collection("links")
      .find({ linkPageId: linkPage._id })
      .sort({ order: -1 })
      .limit(1)
      .toArray()

    const order = maxOrderLink.length > 0 ? maxOrderLink[0].order + 1 : 0

    // Yeni linki ekle
    const result = await db.collection("links").insertOne({
      ...data,
      linkPageId: linkPage._id,
      order,
      isActive: true,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      _id: result.insertedId,
      ...data,
      linkPageId: linkPage._id,
      order,
      isActive: true,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Link ekleme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Link sil
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const linkId = url.pathname.split("/").pop()

    if (!linkId) {
      return NextResponse.json(
        { error: "Link ID bulunamadı" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne(
      { email: token.email }
    )

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    const linkPage = await db.collection("linkPages").findOne(
      { userId: user._id.toString() }
    )

    if (!linkPage) {
      return NextResponse.json(
        { error: "Link sayfası bulunamadı" },
        { status: 404 }
      )
    }

    // Linkin kullanıcıya ait olduğunu kontrol et
    const link = await db.collection("links").findOne({
      _id: new ObjectId(linkId),
      linkPageId: linkPage._id.toString()
    })

    if (!link) {
      return NextResponse.json(
        { error: "Link bulunamadı" },
        { status: 404 }
      )
    }

    await db.collection("links").deleteOne({
      _id: new ObjectId(linkId)
    })

    return NextResponse.json({
      message: "Link silindi"
    })
  } catch (error) {
    console.error("Link silme hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 