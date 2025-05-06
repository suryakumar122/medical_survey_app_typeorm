import { pgTable, serial, text, timestamp, varchar, integer, boolean, json, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['doctor', 'representative', 'client', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['pending', 'active', 'inactive', 'suspended']);
export const surveyStatusEnum = pgEnum('survey_status', ['draft', 'active', 'inactive', 'completed']);
export const questionTypeEnum = pgEnum('question_type', ['text', 'likert', 'multipleChoice', 'checkbox', 'ranking', 'matrix']);
export const redemptionStatusEnum = pgEnum('redemption_status', ['pending', 'processing', 'completed', 'rejected']);
export const redemptionTypeEnum = pgEnum('redemption_type', ['upi', 'amazon']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  role: userRoleEnum('role').notNull(),
  status: userStatusEnum('status').notNull().default('pending'),
  profilePicture: text('profile_picture'),
  activationToken: varchar('activation_token', { length: 255 }),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Doctors table
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  specialty: varchar('specialty', { length: 255 }),
  hospital: varchar('hospital', { length: 255 }),
  bio: text('bio'),
  totalPoints: integer('total_points').notNull().default(0),
  redeemedPoints: integer('redeemed_points').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clients table
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 255 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Representatives table
export const representatives = pgTable('representatives', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  clientId: integer('client_id').notNull().references(() => clients.id),
  region: varchar('region', { length: 255 }),
  territory: varchar('territory', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Surveys table
export const surveys = pgTable('surveys', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  points: integer('points').notNull(),
  estimatedTime: integer('estimated_time').notNull(),
  status: surveyStatusEnum('status').notNull().default('draft'),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  targetSpecialty: varchar('target_specialty', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Survey Questions table
export const surveyQuestions = pgTable('survey_questions', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id').notNull().references(() => surveys.id),
  questionText: text('question_text').notNull(),
  questionType: questionTypeEnum('question_type').notNull(),
  options: json('options'),
  required: boolean('required').notNull().default(false),
  orderIndex: integer('order_index').notNull(),
  conditionalLogic: json('conditional_logic'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Doctor Survey Responses table
export const doctorSurveyResponses = pgTable('doctor_survey_responses', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id),
  surveyId: integer('survey_id').notNull().references(() => surveys.id),
  completed: boolean('completed').notNull().default(false),
  pointsEarned: integer('points_earned').notNull().default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Question Responses table
export const questionResponses = pgTable('question_responses', {
  id: serial('id').primaryKey(),
  doctorSurveyResponseId: integer('doctor_survey_response_id').notNull().references(() => doctorSurveyResponses.id),
  questionId: integer('question_id').notNull().references(() => surveyQuestions.id),
  responseData: json('response_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Redemptions table
export const redemptions = pgTable('redemptions', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id),
  points: integer('points').notNull(),
  redemptionType: redemptionTypeEnum('redemption_type').notNull(),
  redemptionDetails: json('redemption_details'),
  status: redemptionStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Doctor-Client Mapping table
export const doctorClientMappings = pgTable('doctor_client_mappings', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id),
  clientId: integer('client_id').notNull().references(() => clients.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Doctor-Representative Mapping table
export const doctorRepMappings = pgTable('doctor_rep_mappings', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id),
  repId: integer('rep_id').notNull().references(() => representatives.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  client: one(clients, { fields: [users.id], references: [clients.userId] }),
  representative: one(representatives, { fields: [users.id], references: [representatives.userId] }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  clientMappings: many(doctorClientMappings),
  repMappings: many(doctorRepMappings),
  surveyResponses: many(doctorSurveyResponses),
  redemptions: many(redemptions),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  representatives: many(representatives),
  surveys: many(surveys),
  doctorMappings: many(doctorClientMappings),
}));

export const representativesRelations = relations(representatives, ({ one, many }) => ({
  user: one(users, { fields: [representatives.userId], references: [users.id] }),
  client: one(clients, { fields: [representatives.clientId], references: [clients.id] }),
  doctorMappings: many(doctorRepMappings),
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  client: one(clients, { fields: [surveys.clientId], references: [clients.id] }),
  questions: many(surveyQuestions),
  responses: many(doctorSurveyResponses),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one, many }) => ({
  survey: one(surveys, { fields: [surveyQuestions.surveyId], references: [surveys.id] }),
  responses: many(questionResponses),
}));

export const doctorSurveyResponsesRelations = relations(doctorSurveyResponses, ({ one, many }) => ({
  doctor: one(doctors, { fields: [doctorSurveyResponses.doctorId], references: [doctors.id] }),
  survey: one(surveys, { fields: [doctorSurveyResponses.surveyId], references: [surveys.id] }),
  questionResponses: many(questionResponses),
}));

export const questionResponsesRelations = relations(questionResponses, ({ one }) => ({
  doctorSurveyResponse: one(doctorSurveyResponses, { fields: [questionResponses.doctorSurveyResponseId], references: [doctorSurveyResponses.id] }),
  question: one(surveyQuestions, { fields: [questionResponses.questionId], references: [surveyQuestions.id] }),
}));

export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  doctor: one(doctors, { fields: [redemptions.doctorId], references: [doctors.id] }),
}));

export const doctorClientMappingsRelations = relations(doctorClientMappings, ({ one }) => ({
  doctor: one(doctors, { fields: [doctorClientMappings.doctorId], references: [doctors.id] }),
  client: one(clients, { fields: [doctorClientMappings.clientId], references: [clients.id] }),
}));

export const doctorRepMappingsRelations = relations(doctorRepMappings, ({ one }) => ({
  doctor: one(doctors, { fields: [doctorRepMappings.doctorId], references: [doctors.id] }),
  representative: one(representatives, { fields: [doctorRepMappings.repId], references: [representatives.id] }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Representative = typeof representatives.$inferSelect;
export type InsertRepresentative = typeof representatives.$inferInsert;

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = typeof surveys.$inferInsert;

export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type InsertSurveyQuestion = typeof surveyQuestions.$inferInsert;

export type DoctorSurveyResponse = typeof doctorSurveyResponses.$inferSelect;
export type InsertDoctorSurveyResponse = typeof doctorSurveyResponses.$inferInsert;

export type QuestionResponse = typeof questionResponses.$inferSelect;
export type InsertQuestionResponse = typeof questionResponses.$inferInsert;

export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = typeof redemptions.$inferInsert;

export type DoctorClientMapping = typeof doctorClientMappings.$inferSelect;
export type InsertDoctorClientMapping = typeof doctorClientMappings.$inferInsert;

export type DoctorRepMapping = typeof doctorRepMappings.$inferSelect;
export type InsertDoctorRepMapping = typeof doctorRepMappings.$inferInsert;