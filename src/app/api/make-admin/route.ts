import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import clientPromise from "@/lib/mongodb"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Token kontrolü
    const token = await getToken({ req: request })
    
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Önce kullanıcıyı kontrol et
    const user = await db.collection("users").findOne({
      email: "dogukanalpt@gmail.com"
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Kullanıcı zaten admin mi kontrol et
    if (user.role === "ADMIN") {
      return NextResponse.json({
        message: "Kullanıcı zaten admin"
      })
    }

    // Kullanıcıyı admin yap
    const result = await db.collection("users").updateOne(
      { email: "dogukanalpt@gmail.com" },
      { 
        $set: { 
          role: "ADMIN",
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
      message: "Kullanıcı admin yapıldı"
    })
  } catch (error) {
    console.error("Admin yapma hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 