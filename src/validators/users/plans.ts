import { z } from "zod";

export const createPlanSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    // ✅ استخدم coerce.date() أو string() للتواريخ اللي جاية من JSON
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    // ✅ courseId جاي كـ number مش string
    courseId: z.number().or(z.string().transform(val => Number(val))),
    // ✅ createdBy مش لازم يبعته المستخدم - هتاخده من req.user
    // createdBy: z.number(), // احذف ده
    type: z.enum(["study", "exam", "homework", "quiz"]),
  }).strict(),
});

export const updatePlanSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    courseId: z.number().or(z.string().transform(val => Number(val))).optional(),
    type: z.enum(["study", "exam", "homework", "quiz"]).optional(),
  }).strict(),
});
