import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import * as z from "zod"
import { ObjectId } from "mongodb"

// Kayıt şeması
const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı").regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"),
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı")
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, email, password } = registerSchema.parse(body)

    const client = await clientPromise
    const db = client.db()

    // Email kontrolü
    const existingEmail = await db.collection("users").findOne({ email })

    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Kullanıcı adı kontrolü
    const existingUsername = await db.collection("users").findOne({ username })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcıyı oluştur
    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      name: username, // Varsayılan olarak username'i name olarak kullan
      role: "USER",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Link sayfası oluştur
    await db.collection("linkPages").insertOne({
      userId: result.insertedId,
      description: `${username}'in link sayfası`,
      theme: "default",
      backgroundColor: "#050505",
      textColor: "#ffffff",
      font: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonColor: "#865DFF",
      buttonTextColor: "#ffffff",
      animation: "none",
      backgroundPattern: "none",
      isPublic: true,
      viewCount: 0,
      links: [], // Boş link dizisi ekle
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      user: {
        id: result.insertedId.toString(),
        username,
        email
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Kayıt hatası:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    )
  }
} 