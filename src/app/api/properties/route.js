import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth.js'
import { db } from '../../../db/index.js'
import { properties } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(properties).where(eq(properties.userId, session.user.id))
  return NextResponse.json(rows)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const [property] = await db
    .insert(properties)
    .values({ userId: session.user.id, ...body })
    .returning()
  return NextResponse.json(property)
}
