import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

const providers = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, credentials.email))
        .limit(1)
      if (!user || !user.passwordHash) return null
      const valid = await bcrypt.compare(credentials.password, user.passwordHash)
      if (!valid) return null
      return { id: user.id, email: user.email, name: user.name }
    },
  }),
]

// Only add Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions = {
  providers,

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          let [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1)
          if (!dbUser) {
            ;[dbUser] = await db
              .insert(users)
              .values({ email: user.email, name: user.name ?? null })
              .returning()
          }
          token.userId = dbUser.id
        } else {
          token.userId = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId
      return session
    },
  },

  pages: { signIn: '/sign-in' },
  secret: process.env.NEXTAUTH_SECRET,
}
