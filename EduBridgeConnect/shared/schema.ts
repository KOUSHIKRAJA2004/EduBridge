import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table - Common fields for both students and sponsors
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'student' or 'sponsor'
  displayName: text("display_name").notNull(),
  profileCompleted: boolean("profile_completed").default(false),
});

// Student profiles
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  age: integer("age"),
  educationLevel: text("education_level"),
  course: text("course"),
  institutionName: text("institution_name"),
  financialNeed: integer("financial_need"),
  skills: text("skills").array(),
  bio: text("bio"),
  documents: jsonb("documents").default({}),
});

// Sponsor profiles
export const sponsorProfiles = pgTable("sponsor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type"), // 'individual', 'corporate', 'ngo'
  organization: text("organization"),
  website: text("website"),
  focusAreas: text("focus_areas").array(),
  bio: text("bio"),
});

// Funding applications
export const fundingApplications = pgTable("funding_applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  amount: integer("amount").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  documents: jsonb("documents").default({}),
});

// Sponsorships
export const sponsorships = pgTable("sponsorships", {
  id: serial("id").primaryKey(),
  sponsorId: integer("sponsor_id").notNull().references(() => sponsorProfiles.id),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  applicationId: integer("application_id").references(() => fundingApplications.id),
  amount: integer("amount").notNull(),
  status: text("status").default("active"), // 'active', 'completed', 'cancelled'
  paymentId: text("payment_id"), // Stripe payment ID
  createdAt: timestamp("created_at").defaultNow(),
  mentorshipOffered: boolean("mentorship_offered").default(false),
});

// Micro-jobs
export const microJobs = pgTable("micro_jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  postedBy: integer("posted_by").notNull().references(() => users.id),
  skillsRequired: text("skills_required").array(),
  compensation: integer("compensation").notNull(),
  status: text("status").default("open"), // 'open', 'assigned', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  profileCompleted: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
});

export const insertSponsorProfileSchema = createInsertSchema(sponsorProfiles).omit({
  id: true,
});

export const insertFundingApplicationSchema = createInsertSchema(fundingApplications).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true,
  createdAt: true,
  status: true,
  paymentId: true,
});

export const insertMicroJobSchema = createInsertSchema(microJobs).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;

export type SponsorProfile = typeof sponsorProfiles.$inferSelect;
export type InsertSponsorProfile = z.infer<typeof insertSponsorProfileSchema>;

export type FundingApplication = typeof fundingApplications.$inferSelect;
export type InsertFundingApplication = z.infer<typeof insertFundingApplicationSchema>;

export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;

export type MicroJob = typeof microJobs.$inferSelect;
export type InsertMicroJob = z.infer<typeof insertMicroJobSchema>;
