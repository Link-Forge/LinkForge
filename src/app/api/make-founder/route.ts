import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import clientPromise from "@/lib/mongodb"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Önce kullanıcıyı kontrol et
    const user = await db.collection("users").findOne({
      email: "dogukanalpt@gmail.com" // Burayı kendi emailiniz ile değiştirin
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Kullanıcı zaten founder mı kontrol et
    if (user.role === "FOUNDER") {
      return NextResponse.json({
        message: "Kullanıcı zaten founder"
      })
    }

    // Kullanıcıyı founder yap
    const result = await db.collection("users").updateOne(
      { email: "dogukanalpt@gmail.com" },
      { 
        $set: { 
          role: "FOUNDER",
          updatedAt: new Date()
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        error: "Güncelleme başarısız oldu"
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Kullanıcı founder yapıldı"
    })
  } catch (error) {
    console.error("Founder yapma hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 