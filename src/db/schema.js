import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

export const properties = pgTable('grantiq_properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull().default(''),
  propertyType: text('property_type').notNull(),
  scope: text('scope').notNull(),
  budget: text('budget').default('unsure'),
  startDate: text('start_date').default(''),
  createdAt: timestamp('created_at').defaultNow(),
})

export const grantWorkbooks = pgTable('grantiq_workbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const grantStates = pgTable('grantiq_grant_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  workbookId: uuid('workbook_id').notNull().references(() => grantWorkbooks.id, { onDelete: 'cascade' }),
  grantId: text('grant_id').notNull(),
  workflowStatus: text('workflow_status').notNull().default('Not started'),
  emailBody: text('email_body'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const checklistStates = pgTable('grantiq_checklist_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  grantStateId: uuid('grant_state_id').notNull().references(() => grantStates.id, { onDelete: 'cascade' }),
  itemIndex: integer('item_index').notNull(),
  done: boolean('done').notNull().default(false),
})

export const statusHistory = pgTable('grantiq_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  grantStateId: uuid('grant_state_id').notNull().references(() => grantStates.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
})
