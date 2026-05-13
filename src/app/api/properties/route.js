import { auth } from '@clerk/nextjs/server'
import { db } from '../../../db/index.js'
import { properties } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(properties).where(eq(properties.userId, userId))
  return NextResponse.json(rows)
}

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const [property] = await db
    .insert(properties)
    .values({ userId, ...body })
    .returning()
  return NextResponse.json(property)
}
