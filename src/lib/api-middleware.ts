import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { getMongoDb } from "@/lib/mongodb"

export async function validateUser(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return {
        error: "Oturum bulunamadı",
        status: 401
      }
    }

    const db = await getMongoDb()
    const user = await db.collection("users").findOne({ email: token.email })

    if (!user) {
      return {
        error: "Kullanıcı bulunamadı veya silinmiş",
        status: 401,
        redirect: '/login'
      }
    }

    return { user, token }
  } catch (error) {
    console.error("Kullanıcı doğrulama hatası:", error)
    return {
      error: "Bir hata oluştu",
      status: 500
    }
  }
} 