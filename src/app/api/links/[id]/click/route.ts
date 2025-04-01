import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getMongoDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getMongoDb()

    // Link ID'sini al
    const linkId = params.id

    // Linki bul ve tıklanma sayısını artır
    const result = await db.collection("links").updateOne(
      { _id: new ObjectId(linkId) },
      { $inc: { clickCount: 1 } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Link bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Link tıklama hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 