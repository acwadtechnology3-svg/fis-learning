import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
    level: z.string().optional(),
    year: z.string().optional(),
    fcmToken: z.string().optional(),
    googleId: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z.string(),
    code: z.string().length(6, "Verification code must be 6 characters long"),
  }),
});

export const sendResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
  }),
});

export const checkResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(6, "Reset code must be 6 characters long"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(6, "Reset code must be 6 characters long"),
    newPassword: z.string().min(8),
  }),
});
