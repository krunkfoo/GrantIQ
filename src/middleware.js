import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublic = createRouteMatcher(['/', '/demo(.*)', '/sign-in(.*)', '/sign-up(.*)'])

const hasValidKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_')
  && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')

export default hasValidKey
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublic(req)) await auth.protect()
    })
  : () => NextResponse.next()

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
