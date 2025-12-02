"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamSchema = exports.createExamSchema = void 0;
const zod_1 = require("zod");
// Time format validation (HH:MM:SS or HH:MM)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
exports.createExamSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.number().min(1).or(zod_1.z.string().transform(val => Number(val))),
        date: zod_1.z.coerce.date(),
        time: zod_1.z.string().regex(timeRegex, "Time must be in format HH:MM or HH:MM:SS"),
        location: zod_1.z.string().min(1),
        createdBy: zod_1.z.number(),
    }).strict(),
});
exports.updateExamSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.number().min(1).or(zod_1.z.string().transform(val => Number(val))).optional(),
        date: zod_1.z.coerce.date().optional(),
        time: zod_1.z.string().regex(timeRegex, "Time must be in format HH:MM or HH:MM:SS").optional(),
        location: zod_1.z.string().min(1).optional(),
        createdBy: zod_1.z.number().optional(),
    }).strict(),
});
