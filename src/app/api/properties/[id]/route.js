import { auth } from '@clerk/nextjs/server'
import { db } from '../../../../db/index.js'
import { properties } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.delete(properties).where(and(eq(properties.id, params.id), eq(properties.userId, userId)))
  return NextResponse.json({ ok: true })
}
