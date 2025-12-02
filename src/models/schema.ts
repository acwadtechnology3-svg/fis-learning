// src/db/schema.ts
import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  date,
  time,
  pgEnum,
  varchar,
} from "drizzle-orm/pg-core";

//
// ===== Enums =====
//

export const planTypeEnum = pgEnum("plan_type", [
  "study",
  "exam",
  "homework",
  "quiz",
]);

export const quizDifficultyEnum = pgEnum("quiz_difficulty", [
  "low",
  "medium",
  "hard",
]);

export const quizTypeEnum = pgEnum("quiz_type", [
  "multichoice",
  "true_false",
   "mixed"
]);

export const UserYearEnum = pgEnum("user_year", [
  "1stYear",
  "2ndYear",
  "3rdYear",
  "4thYear",
  "5thYear",
]);
//
// ===== Tables =====
//

// users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("User"),
  phone: text("phone"),
  level: text("level"),
  year: UserYearEnum("year").notNull().default("1stYear"),
  fcmToken: text("fcm_token"),
  googleId: text("google_id"),
  isVerified: boolean("is_verified").notNull().default(false),
});

// admins
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  gmail: text("gmail").notNull(),
  role: text("role").notNull().default("Admin"),
  image: text("image"),
});

// courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),

  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  filePath: text("file_path").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  difficulty: quizDifficultyEnum("difficulty").notNull(),
  type: quizTypeEnum("type").notNull(),
});

export const quizMaterials = pgTable("quiz_materials", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  materialId: integer("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "cascade" }),
});

// parents
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  userPhone: text("user_phone").notNull(),  
  isVerified: boolean("is_verified").notNull().default(false),
  password: text("password").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  type: planTypeEnum("type").notNull(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
});

// exams
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  time: time("time").notNull(),
  location: text("location").notNull(),
});

// emailVerification
export const emailVerification = pgTable("email_verification", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
});

// smsVerification
export const smsVerification = pgTable("sms_verification", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => parents.id, { onDelete: "cascade" }),
  expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
});
