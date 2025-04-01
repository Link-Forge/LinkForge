import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { recordVisit } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, visitorId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı ID'si gerekli" },
        { status: 400 }
      )
    }

    const result = await recordVisit(userId, visitorId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Ziyaret kaydedilemedi:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 