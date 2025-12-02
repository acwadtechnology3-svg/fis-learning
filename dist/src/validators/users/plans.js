"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlanSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        // ✅ استخدم coerce.date() أو string() للتواريخ اللي جاية من JSON
        startDate: zod_1.z.coerce.date(),
        endDate: zod_1.z.coerce.date(),
        // ✅ courseId جاي كـ number مش string
        courseId: zod_1.z.number().or(zod_1.z.string().transform(val => Number(val))),
        // ✅ createdBy مش لازم يبعته المستخدم - هتاخده من req.user
        // createdBy: z.number(), // احذف ده
        type: zod_1.z.enum(["study", "exam", "homework", "quiz"]),
    }).strict(),
});
exports.updatePlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        startDate: zod_1.z.coerce.date().optional(),
        endDate: zod_1.z.coerce.date().optional(),
        courseId: zod_1.z.number().or(zod_1.z.string().transform(val => Number(val))).optional(),
        type: zod_1.z.enum(["study", "exam", "homework", "quiz"]).optional(),
    }).strict(),
});
