import { pgTable, serial, text, integer, timestamp, doublePrecision, varchar } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('stable'),
  room: varchar('room', { length: 50 }),
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vitalsLog = pgTable('vitals_log', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  heartRate: integer('heart_rate'),
  spo2: integer('spo2'),
  temp: doublePrecision('temp'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id),
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  senderPhone: varchar('sender_phone', { length: 20 }),
  direction: varchar('direction', { length: 20 }).notNull(), // 'inbound' or 'outbound'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});
