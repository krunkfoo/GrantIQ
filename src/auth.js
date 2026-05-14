import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from './db/index.js'
import { users } from './db/schema.js'
import { authConfig } from './auth.config.js'

const providers = [
  Credentials({
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, String(credentials.email)))
        .limit(1)
      if (!user || !user.passwordHash) return null
      const valid = await bcrypt.compare(String(credentials.password), user.passwordHash)
      if (!valid) return null
      return { id: user.id, email: user.email, name: user.name }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Request Gmail read access so we can sync replies
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
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
          // Store Gmail access token for inbox sync
          token.gmailAccessToken = account.access_token ?? null
          token.gmailRefreshToken = account.refresh_token ?? null
        } else {
          token.userId = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = String(token.userId)
      // Expose whether Gmail is connected (not the token itself)
      session.gmailConnected = !!token.gmailAccessToken
      // Pass token to server — only accessible server-side via auth()
      session._gmailAccessToken = token.gmailAccessToken ?? null
      return session
    },
  },
})
