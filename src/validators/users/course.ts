// validators/users/course.ts
import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
  }),
  // لو حابب تضيف query/params هنا برضه بعدين
});

export const updateCourseSchema = z.object({
  body: z.object({
    // optional عشان تقدر تعمل partial update لو حابب
    name: z.string().trim().min(1, "Name is required").optional(),
  }),
});
