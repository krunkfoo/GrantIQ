// Lightweight auth config — no Node.js-only imports (bcrypt, pg, etc.)
// Safe to import in Edge runtime (middleware).
// auth.js extends this with the full Credentials + Google providers.

const publicPaths = ['/', '/demo', '/sign-in', '/sign-up', '/api/auth']

function isPublic(pathname) {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export const authConfig = {
  pages: { signIn: '/sign-in' },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (isPublic(nextUrl.pathname)) return true
      if (auth?.user) return true
      return false // triggers redirect to signIn page
    },
    async jwt({ token, user, account }) {
      if (user) token.userId = user.id
      return token
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = String(token.userId)
      return session
    },
  },
  providers: [], // populated in auth.js
}
