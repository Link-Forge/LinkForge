import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Kullanıcıyı bul
    const user = await db.collection("users").findOne(
      { username: "parsher" }
    )

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // LinkPage'i bul ve güncelle
    const linkPage = await db.collection("linkPages").findOne(
      { _id: new ObjectId('67b61902780a2ea86cca978a') }
    )

    if (!linkPage) {
      return NextResponse.json(
        { error: "Link sayfası bulunamadı" },
        { status: 404 }
      )
    }

    // userId'yi güncelle
    await db.collection("linkPages").updateOne(
      { _id: new ObjectId('67b61902780a2ea86cca978a') },
      { 
        $set: { 
          userId: user._id,
          updatedAt: new Date()
        } 
      }
    )

    // Links koleksiyonundaki linkPageId'leri de güncelle
    await db.collection("links").updateMany(
      {},
      {
        $set: {
          linkPageId: new ObjectId('67b61902780a2ea86cca978a'),
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      message: "Link sayfası ve linkler güncellendi",
      userId: user._id,
      linkPageId: '67b61902780a2ea86cca978a'
    })

  } catch (error) {
    console.error("Hata:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 