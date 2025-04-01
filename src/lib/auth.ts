import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "@/lib/mongodb"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

let client: MongoClient
let db: any

async function init() {
  if (!client) {
    client = await clientPromise
    db = client.db()
  }
  return { client, db }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gerekli")
        }

        const { db } = await init()
        
        const user = await db.collection("users").findOne({
          email: credentials.email
        })

        if (!user) {
          throw new Error("Kullanıcı bulunamadı")
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Hesabınız aktif değil")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Geçersiz şifre")
        }

        // Link sayfasını bul
        const linkPage = await db.collection("linkPages").findOne({
          userId: user._id
        })

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status,
          avatar: linkPage?.avatar || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Session güncellendiğinde token'ı güncelle
        return {
          ...token,
          ...session
        }
      }
      
      if (user) {
        // İlk girişte user bilgilerini token'a ekle
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.username = user.username
        token.role = user.role
        token.status = user.status
        token.avatar = user.avatar
      }
      
      // Her istekte güncel kullanıcı bilgilerini al
      if (token?.email) {
        const { db } = await init()
        const currentUser = await db.collection("users").findOne({ email: token.email })
        if (currentUser) {
          token.role = currentUser.role
          token.status = currentUser.status
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.avatar = token.avatar as string
      }
      return session
    }
  }
} 