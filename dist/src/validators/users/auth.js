"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.checkResetCodeSchema = exports.sendResetCodeSchema = exports.verifyEmailSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters long"),
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        phone: zod_1.z.string().optional(),
        level: zod_1.z.string().optional(),
        year: zod_1.z.string().optional(),
        fcmToken: zod_1.z.string().optional(),
        googleId: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
    }),
});
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string(),
        code: zod_1.z.string().length(6, "Verification code must be 6 characters long"),
    }),
});
exports.sendResetCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email"),
    }),
});
exports.checkResetCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email"),
        code: zod_1.z.string().length(6, "Reset code must be 6 characters long"),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email"),
        code: zod_1.z.string().length(6, "Reset code must be 6 characters long"),
        newPassword: zod_1.z.string().min(8),
    }),
});
