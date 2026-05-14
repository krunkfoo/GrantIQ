import { getToken } from 'next-auth/jwt'
import { db } from '../../../../db/index.js'
import { properties } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.delete(properties).where(
    and(eq(properties.id, params.id), eq(properties.userId, token.userId))
  )
  return NextResponse.json({ ok: true })
}
