"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsVerification = exports.emailVerification = exports.exams = exports.plans = exports.parents = exports.quizMaterials = exports.quizzes = exports.materials = exports.courses = exports.admins = exports.users = exports.UserYearEnum = exports.quizTypeEnum = exports.quizDifficultyEnum = exports.planTypeEnum = void 0;
// src/db/schema.ts
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
//
// ===== Enums =====
//
exports.planTypeEnum = (0, pg_core_1.pgEnum)("plan_type", [
    "study",
    "exam",
    "homework",
    "quiz",
]);
exports.quizDifficultyEnum = (0, pg_core_1.pgEnum)("quiz_difficulty", [
    "low",
    "medium",
    "hard",
]);
exports.quizTypeEnum = (0, pg_core_1.pgEnum)("quiz_type", [
    "multichoice",
    "true_false",
    "mixed"
]);
exports.UserYearEnum = (0, pg_core_1.pgEnum)("user_year", [
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
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default("User"),
    phone: (0, pg_core_1.text)("phone"),
    level: (0, pg_core_1.text)("level"),
    year: (0, exports.UserYearEnum)("year").notNull().default("1stYear"),
    fcmToken: (0, pg_core_1.text)("fcm_token"),
    googleId: (0, pg_core_1.text)("google_id"),
    isVerified: (0, pg_core_1.boolean)("is_verified").notNull().default(false),
});
// admins
exports.admins = (0, pg_core_1.pgTable)("admins", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    gmail: (0, pg_core_1.text)("gmail").notNull(),
    role: (0, pg_core_1.text)("role").notNull().default("Admin"),
    image: (0, pg_core_1.text)("image"),
});
// courses
exports.courses = (0, pg_core_1.pgTable)("courses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    createdBy: (0, pg_core_1.integer)("created_by")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).notNull().default((0, drizzle_orm_1.sql) `now()`),
});
exports.materials = (0, pg_core_1.pgTable)("materials", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    courseId: (0, pg_core_1.integer)("course_id")
        .notNull()
        .references(() => exports.courses.id, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    filePath: (0, pg_core_1.text)("file_path").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// quizzes
exports.quizzes = (0, pg_core_1.pgTable)("quizzes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    courseId: (0, pg_core_1.integer)("course_id")
        .notNull()
        .references(() => exports.courses.id, { onDelete: "cascade" }),
    difficulty: (0, exports.quizDifficultyEnum)("difficulty").notNull(),
    type: (0, exports.quizTypeEnum)("type").notNull(),
});
exports.quizMaterials = (0, pg_core_1.pgTable)("quiz_materials", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    quizId: (0, pg_core_1.integer)("quiz_id")
        .notNull()
        .references(() => exports.quizzes.id, { onDelete: "cascade" }),
    materialId: (0, pg_core_1.integer)("material_id")
        .notNull()
        .references(() => exports.materials.id, { onDelete: "cascade" }),
});
// parents
exports.parents = (0, pg_core_1.pgTable)("parents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userPhone: (0, pg_core_1.text)("user_phone").notNull(),
    isVerified: (0, pg_core_1.boolean)("is_verified").notNull().default(false),
    password: (0, pg_core_1.text)("password").notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
});
// plans
exports.plans = (0, pg_core_1.pgTable)("plans", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date").notNull(),
    type: (0, exports.planTypeEnum)("type").notNull(),
    createdBy: (0, pg_core_1.integer)("created_by")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    courseId: (0, pg_core_1.integer)("course_id")
        .notNull()
        .references(() => exports.courses.id, { onDelete: "cascade" }),
});
// exams
exports.exams = (0, pg_core_1.pgTable)("exams", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    courseId: (0, pg_core_1.integer)("course_id")
        .notNull()
        .references(() => exports.courses.id, { onDelete: "cascade" }),
    date: (0, pg_core_1.date)("date").notNull(),
    time: (0, pg_core_1.time)("time").notNull(),
    location: (0, pg_core_1.text)("location").notNull(),
});
// emailVerification
exports.emailVerification = (0, pg_core_1.pgTable)("email_verification", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    code: (0, pg_core_1.text)("code").notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    expiredAt: (0, pg_core_1.timestamp)("expired_at", { withTimezone: true }).notNull(),
});
// smsVerification
exports.smsVerification = (0, pg_core_1.pgTable)("sms_verification", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    code: (0, pg_core_1.text)("code").notNull(),
    parentId: (0, pg_core_1.integer)("parent_id")
        .notNull()
        .references(() => exports.parents.id, { onDelete: "cascade" }),
    expiredAt: (0, pg_core_1.timestamp)("expired_at", { withTimezone: true }).notNull(),
});
