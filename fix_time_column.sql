-- Fix the time column type in exams table
-- Run this SQL script in your database before using drizzle-kit push

-- Check current column type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exams' AND column_name = 'time';

-- Fix the column type if needed
ALTER TABLE "exams" 
ALTER COLUMN "time" TYPE time WITHOUT TIME ZONE 
USING "time"::time WITHOUT TIME ZONE;

