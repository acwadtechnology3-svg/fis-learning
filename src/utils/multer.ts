// src/middlewares/upload.ts
import multer from "multer";

export const uploadMaterial = multer({
  storage: multer.memoryStorage(), // نخلي Multer يحتفظ بالفايل في الذاكرة
  limits: {
    fileSize: 50 * 1024 * 1024, // 20MB مثالاً – عدّلها حسب احتياجك
  },
});
