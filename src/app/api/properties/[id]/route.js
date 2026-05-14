import { auth } from '../../../../auth.js'
import { db } from '../../../../db/index.js'
import { properties } from '../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.delete(properties).where(
    and(eq(properties.id, params.id), eq(properties.userId, session.user.id))
  )
  return NextResponse.json({ ok: true })
}
