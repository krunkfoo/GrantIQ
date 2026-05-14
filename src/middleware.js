import { auth } from './auth.js'
import { NextResponse } from 'next/server'

const publicPaths = ['/', '/demo', '/sign-in', '/sign-up', '/api/auth']

function isPublic(pathname) {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()
  if (!req.auth) {
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
