import { getToken } from 'next-auth/jwt'
import { db } from '../../../../../db/index.js'
import { grantStates, checklistStates, statusHistory, grantWorkbooks, properties } from '../../../../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

async function getGrantState(userId, propertyId, grantId) {
  const [prop] = await db.select().from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId))).limit(1)
  if (!prop) return null

  const [workbook] = await db.select().from(grantWorkbooks)
    .where(eq(grantWorkbooks.propertyId, propertyId)).limit(1)
  if (!workbook) return null

  const [state] = await db.select().from(grantStates)
    .where(and(eq(grantStates.workbookId, workbook.id), eq(grantStates.grantId, grantId))).limit(1)
  return state ?? null
}

export async function PATCH(req, { params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId, grantId } = await params
  const body = await req.json()
  const state = await getGrantState(token.userId, propertyId, grantId)
  if (!state) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.workflowStatus !== undefined || body.emailBody !== undefined || body.notes !== undefined) {
    const updates = {}
    if (body.workflowStatus !== undefined) updates.workflowStatus = body.workflowStatus
    if (body.emailBody !== undefined) updates.emailBody = body.emailBody
    if (body.notes !== undefined) updates.notes = body.notes
    updates.updatedAt = new Date()
    await db.update(grantStates).set(updates).where(eq(grantStates.id, state.id))

    if (body.workflowStatus !== undefined) {
      await db.insert(statusHistory).values({
        grantStateId: state.id,
        event: body.workflowStatus,
        note: body.statusNote ?? null,
      })
    }
  }

  if (body.checklistIndex !== undefined && body.done !== undefined) {
    const existing = await db.select().from(checklistStates)
      .where(and(eq(checklistStates.grantStateId, state.id), eq(checklistStates.itemIndex, body.checklistIndex)))
      .limit(1)

    if (existing.length > 0) {
      await db.update(checklistStates).set({ done: body.done })
        .where(and(eq(checklistStates.grantStateId, state.id), eq(checklistStates.itemIndex, body.checklistIndex)))
    } else {
      await db.insert(checklistStates).values({
        grantStateId: state.id,
        itemIndex: body.checklistIndex,
        done: body.done,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
