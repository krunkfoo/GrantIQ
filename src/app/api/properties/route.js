import { getToken } from 'next-auth/jwt'
import { db } from '../../../db/index.js'
import { properties } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(properties).where(eq(properties.userId, token.userId))
  return NextResponse.json(rows)
}

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const [property] = await db
    .insert(properties)
    .values({ userId: token.userId, ...body })
    .returning()
  return NextResponse.json(property)
}
