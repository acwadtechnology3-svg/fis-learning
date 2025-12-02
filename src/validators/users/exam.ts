import { z } from "zod";

// Time format validation (HH:MM:SS or HH:MM)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export const createExamSchema = z.object({
    body: z.object({
        courseId: z.number().min(1).or(z.string().transform(val => Number(val))),
        date: z.coerce.date(),
        time: z.string().regex(timeRegex, "Time must be in format HH:MM or HH:MM:SS"),
        location: z.string().min(1),
        createdBy: z.number(),
    }).strict(),
});

export const updateExamSchema = z.object({
    body: z.object({
        courseId: z.number().min(1).or(z.string().transform(val => Number(val))).optional(),
        date: z.coerce.date().optional(),
        time: z.string().regex(timeRegex, "Time must be in format HH:MM or HH:MM:SS").optional(),
        location: z.string().min(1).optional(),
        createdBy: z.number().optional(),
    }).strict(),
});
