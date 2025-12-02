"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterial = exports.getMaterialById = exports.getMaterialsByCourse = exports.createMaterial = void 0;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_1 = __importDefault(require("../../config/supabase"));
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const createMaterial = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const file = req.file; // من uploadMaterial.single("file")
    const { name } = req.body;
    const rawCourseId = req.body.courseId ?? req.params.courseId;
    if (!file) {
        throw new BadRequest_1.BadRequest("File is required");
    }
    if (!rawCourseId) {
        throw new BadRequest_1.BadRequest("courseId is required");
    }
    const courseId = Number(rawCourseId);
    if (Number.isNaN(courseId)) {
        throw new BadRequest_1.BadRequest("courseId must be a number");
    }
    // تأكد إن الكورس موجود
    const [course] = await db_1.db
        .select()
        .from(schema_1.courses)
        .where((0, drizzle_orm_1.eq)(schema_1.courses.id, courseId));
    if (!course) {
        throw new Errors_1.NotFound("Course not found");
    }
    // اسم الماتريال
    const materialName = (name || file.originalname).trim();
    // اسم فريد للفايل جوه البكت
    const ext = path_1.default.extname(file.originalname) || "";
    const random = crypto_1.default.randomBytes(8).toString("hex");
    const fileName = `${Date.now()}-${random}${ext}`;
    const pathInBucket = `course-${courseId}/${fileName}`;
    // رفع الفايل على Supabase Storage (bucket: materials)
    const { data: uploadData, error: uploadError } = await supabase_1.default.storage
        .from("materials")
        .upload(pathInBucket, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });
    if (uploadError || !uploadData) {
        throw new BadRequest_1.BadRequest("Upload to Supabase failed: " + (uploadError?.message || "Unknown error"));
    }
    // حفظ الريكورد في DB
    const [material] = await db_1.db
        .insert(schema_1.materials)
        .values({
        courseId,
        name: materialName,
        filePath: uploadData.path, // مثال: "course-5/1712...-abcd.pdf"
    })
        .returning();
    // جِب الـ public URL لو البكت Public
    const { data: publicUrlData } = supabase_1.default.storage
        .from("materials")
        .getPublicUrl(uploadData.path);
    const fileUrl = publicUrlData?.publicUrl || null;
    return (0, response_1.SuccessResponse)(res, {
        message: "Material created successfully",
        data: {
            ...material,
            fileUrl,
        },
    }, 201);
};
exports.createMaterial = createMaterial;
// ========== GET ALL MATERIALS FOR COURSE ==========
const getMaterialsByCourse = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { courseId } = req.params;
    const mats = await db_1.db
        .select()
        .from(schema_1.materials)
        .where((0, drizzle_orm_1.eq)(schema_1.materials.courseId, Number(courseId)));
    const data = mats.map((m) => {
        const { data: publicUrlData } = supabase_1.default.storage
            .from("materials")
            .getPublicUrl(m.filePath);
        return {
            ...m,
            fileUrl: publicUrlData.publicUrl,
        };
    });
    return (0, response_1.SuccessResponse)(res, { data }, 200);
};
exports.getMaterialsByCourse = getMaterialsByCourse;
// ========== GET ONE MATERIAL BY ID ==========
const getMaterialById = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    const [material] = await db_1.db
        .select()
        .from(schema_1.materials)
        .where((0, drizzle_orm_1.eq)(schema_1.materials.id, Number(id)));
    if (!material) {
        throw new Errors_1.NotFound("Material not found");
    }
    const { data: publicUrlData } = supabase_1.default.storage
        .from("materials")
        .getPublicUrl(material.filePath);
    const data = {
        ...material,
        fileUrl: publicUrlData.publicUrl,
    };
    return (0, response_1.SuccessResponse)(res, { data }, 200);
};
exports.getMaterialById = getMaterialById;
// ========== DELETE MATERIAL (DB + Supabase Storage) ==========
const deleteMaterial = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    const [material] = await db_1.db
        .select()
        .from(schema_1.materials)
        .where((0, drizzle_orm_1.eq)(schema_1.materials.id, Number(id)));
    if (!material) {
        throw new Errors_1.NotFound("Material not found");
    }
    // امسح من DB
    await db_1.db.delete(schema_1.materials).where((0, drizzle_orm_1.eq)(schema_1.materials.id, Number(id)));
    // امسح الفايل من Supabase Storage
    await supabase_1.default.storage
        .from("materials")
        .remove([material.filePath]);
    return (0, response_1.SuccessResponse)(res, { message: "Material deleted successfully" }, 200);
};
exports.deleteMaterial = deleteMaterial;
