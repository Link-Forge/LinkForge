import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, username, password } = userSchema.parse(body)

    // Email kontrolü
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Username kontrolü
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    // Kullanıcı ve link sayfası oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        linkPage: {
          create: {
            title: `${name}'in Link Sayfası`,
            theme: "default"
          }
        }
      }
    })

    return NextResponse.json({
      message: "Kayıt başarılı",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
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
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
} 