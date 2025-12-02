import { z } from "zod";

export const loginparentSchema = z.object({
    usernumber: z.string().min(10),
    password: z.string().min(8),
});

export const parentSignupSchema = z.object({
    usernumber: z.string().min(10),
    password: z.string().min(8),
});

export const verifyParentSchema = z.object({
    parentId: z.number(),
    code: z.string().min(6),
});

export const resendParentCodeSchema = z.object({
    parentId: z.number(),
});

