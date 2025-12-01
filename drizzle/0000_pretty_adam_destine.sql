DO $$ BEGIN
 CREATE TYPE "public"."user_year" AS ENUM('1stYear', '2ndYear', '3rdYear', '4thYear', '5thYear');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."plan_type" AS ENUM('study', 'exam', 'homework', 'quiz');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."quiz_difficulty" AS ENUM('low', 'medium', 'hard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."quiz_type" AS ENUM('multichoice', 'true_false', 'mixed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"gmail" text NOT NULL,
	"role" text DEFAULT 'Admin' NOT NULL,
	"image" text,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" integer NOT NULL,
	"expired_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"location" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "material_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer NOT NULL,
	"file_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parents" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"user_phone" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"password" text NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"type" "plan_type" NOT NULL,
	"course_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"material_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"difficulty" "quiz_difficulty" NOT NULL,
	"type" "quiz_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sms_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"parent_id" integer NOT NULL,
	"expired_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'User' NOT NULL,
	"phone" text,
	"level" text,
	"year" "user_year" DEFAULT '1stYear' NOT NULL,
	"fcm_token" text,
	"google_id" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_verification' AND column_name = 'user_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'email_verification_user_id_users_id_fk') THEN
   ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'course_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exams_course_id_courses_id_fk') THEN
   ALTER TABLE "exams" ADD CONSTRAINT "exams_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'material_files' AND column_name = 'material_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'material_files_material_id_materials_id_fk') THEN
   ALTER TABLE "material_files" ADD CONSTRAINT "material_files_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'course_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'materials_course_id_courses_id_fk') THEN
   ALTER TABLE "materials" ADD CONSTRAINT "materials_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parents' AND column_name = 'user_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'parents_user_id_users_id_fk') THEN
   ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'course_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'plans_course_id_courses_id_fk') THEN
   ALTER TABLE "plans" ADD CONSTRAINT "plans_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_materials' AND column_name = 'quiz_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'quiz_materials_quiz_id_quizzes_id_fk') THEN
   ALTER TABLE "quiz_materials" ADD CONSTRAINT "quiz_materials_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_materials' AND column_name = 'material_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'quiz_materials_material_id_materials_id_fk') THEN
   ALTER TABLE "quiz_materials" ADD CONSTRAINT "quiz_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'course_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'quizzes_course_id_courses_id_fk') THEN
   ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;--> statement-breakpoint
DO $$ 
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sms_verification' AND column_name = 'parent_id') THEN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sms_verification_parent_id_parents_id_fk') THEN
   ALTER TABLE "sms_verification" ADD CONSTRAINT "sms_verification_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
 END IF;
EXCEPTION
 WHEN OTHERS THEN null;
END $$;
