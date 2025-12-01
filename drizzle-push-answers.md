# Drizzle Kit Push - How to Answer Prompts

When running `npx drizzle-kit push`, you may encounter prompts asking about column changes.

## For `course_id` in quizzes table:
**Select:** `~ courseId › course_id   rename column`

This renames the existing `courseId` column to `course_id` to match your schema definition.

## General Rule:
- If you see a column name in camelCase (like `courseId`) that should be snake_case (like `course_id`), select the **rename** option
- If the column doesn't exist at all, select the **create** option
- If you're unsure, check your `src/models/Schema.ts` file to see the column name mapping

## Alternative: Use Migrations Instead
If you want to avoid interactive prompts, you can:
1. Cancel the push command (Ctrl+C)
2. Use `npx drizzle-kit generate` to create migration files
3. Review and edit the migration files manually
4. Use `npx drizzle-kit migrate` to apply them

