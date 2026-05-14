import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const publicPaths = ['/', '/demo', '/sign-in', '/sign-up', '/api/auth']

function isPublic(pathname) {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const signIn = new URL('/sign-in', req.url)
    signIn.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
