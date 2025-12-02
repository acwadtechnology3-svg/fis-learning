import { Router } from "express";
import {
  createMaterial,
  getMaterialsByCourse,
  getMaterialById,
  deleteMaterial,
} from "../../controllers/users/matrials";
import { uploadMaterial } from "../../utils/multer";
import { catchAsync } from "../../utils/catchAsync";
import { createMaterialSchema} from "../../validators/users/matrials";
import { validate } from "../../middlewares/validation";

const route = Router();

/**
 * GET /api/users/materials/course/:courseId
 * يرجّع كل الماتريالز الخاصة بكورس معيّن
 */
route.get(
  "/course/:courseId",
  
  catchAsync(getMaterialsByCourse)
);

/**
 * POST /api/users/materials
 * body: name (اختياري), courseId (إجباري)
 * form-data: file (إجباري)
 */
route.post(
  "/",
  validate(createMaterialSchema),
  uploadMaterial.single("file"), // اسم الفيلد في Postman = file
  catchAsync(createMaterial)
);

/**
 * GET /api/users/materials/:id
 * يرجّع ماتريال واحدة بالـ id
 */
route.get(
  "/:id",
  
  catchAsync(getMaterialById)
);

/**
 * DELETE /api/users/materials/:id
 * يمسح الماتريال + الفايل من الـ FS
 */
route.delete(
  "/:id",
  
  catchAsync(deleteMaterial)
);

export default route;
