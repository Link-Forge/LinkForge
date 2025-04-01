import { headers } from "next/headers"
import { getMongoDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function recordVisit(userId: string, visitorId?: string) {
  try {
    const db = await getMongoDb()

    // Ziyaretçi bilgilerini al
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const currentVisitorId = visitorId || crypto.randomUUID()

    // Ziyareti kaydet
    await db.collection("visits").insertOne({
      userId: new ObjectId(userId),
      visitorId: currentVisitorId,
      ip,
      createdAt: new Date()
    })

    // Link sayfasını bul
    const linkPage = await db.collection("linkPages").findOne({
      userId: new ObjectId(userId)
    })

    if (linkPage) {
      // Görüntülenme sayısını artır
      await db.collection("linkPages").updateOne(
        { _id: linkPage._id },
        { $inc: { viewCount: 1 } }
      )
    }

    return { success: true, visitorId: currentVisitorId }
  } catch (error) {
    console.error("Ziyaret kaydedilemedi:", error)
    throw new Error("Ziyaret kaydedilemedi")
  }
} 