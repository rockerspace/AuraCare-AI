import { pgTable, serial, text, integer, timestamp, doublePrecision, varchar } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  facilityId: integer('facility_id').notNull(),
  // HIPAA Security: PHI fields are encrypted at the application level before insertion
  encryptedName: varchar('encrypted_name', { length: 255 }).notNull(),
  age: integer('age').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('stable'),
  room: varchar('room', { length: 50 }),
  encryptedEmergencyContactName: varchar('encrypted_emergency_contact_name', { length: 255 }),
  encryptedEmergencyContactPhone: varchar('encrypted_emergency_contact_phone', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rateLimits = pgTable('rate_limits', {
  ip: varchar('ip', { length: 255 }).primaryKey(),
  requests: integer('requests').notNull().default(0),
  resetAt: timestamp('reset_at').notNull(),
});

export const vitalsLog = pgTable('vitals_log', {
  id: serial('id').primaryKey(),
  facilityId: integer('facility_id').notNull(),
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
