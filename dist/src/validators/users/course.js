"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseSchema = exports.createCourseSchema = void 0;
// validators/users/course.ts
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1, "Name is required"),
    }),
    // لو حابب تضيف query/params هنا برضه بعدين
});
exports.updateCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        // optional عشان تقدر تعمل partial update لو حابب
        name: zod_1.z.string().trim().min(1, "Name is required").optional(),
    }),
});
