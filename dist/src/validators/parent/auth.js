"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendParentCodeSchema = exports.verifyParentSchema = exports.parentSignupSchema = exports.loginparentSchema = void 0;
const zod_1 = require("zod");
exports.loginparentSchema = zod_1.z.object({
    usernumber: zod_1.z.string().min(10),
    password: zod_1.z.string().min(8),
});
exports.parentSignupSchema = zod_1.z.object({
    usernumber: zod_1.z.string().min(10),
    password: zod_1.z.string().min(8),
});
exports.verifyParentSchema = zod_1.z.object({
    parentId: zod_1.z.number(),
    code: zod_1.z.string().min(6),
});
exports.resendParentCodeSchema = zod_1.z.object({
    parentId: zod_1.z.number(),
});
