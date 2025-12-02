"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMaterial = void 0;
// src/middlewares/upload.ts
const multer_1 = __importDefault(require("multer"));
exports.uploadMaterial = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // نخلي Multer يحتفظ بالفايل في الذاكرة
    limits: {
        fileSize: 50 * 1024 * 1024, // 20MB مثالاً – عدّلها حسب احتياجك
    },
});
