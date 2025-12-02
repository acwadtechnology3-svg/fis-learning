"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matrials_1 = require("../../controllers/users/matrials");
const multer_1 = require("../../utils/multer");
const catchAsync_1 = require("../../utils/catchAsync");
const route = (0, express_1.Router)();
/**
 * GET /api/users/materials/course/:courseId
 * يرجّع كل الماتريالز الخاصة بكورس معيّن
 */
route.get("/course/:courseId", (0, catchAsync_1.catchAsync)(matrials_1.getMaterialsByCourse));
/**
 * POST /api/users/materials
 * body: name (اختياري), courseId (إجباري)
 * form-data: file (إجباري)
 */
route.post("/", multer_1.uploadMaterial.single("file"), // اسم الفيلد في Postman = file
(0, catchAsync_1.catchAsync)(matrials_1.createMaterial));
/**
 * GET /api/users/materials/:id
 * يرجّع ماتريال واحدة بالـ id
 */
route.get("/:id", (0, catchAsync_1.catchAsync)(matrials_1.getMaterialById));
/**
 * DELETE /api/users/materials/:id
 * يمسح الماتريال + الفايل من الـ FS
 */
route.delete("/:id", (0, catchAsync_1.catchAsync)(matrials_1.deleteMaterial));
exports.default = route;
