import { Request, Response } from "express";
import path from "path";
import crypto from "crypto";
import { db } from "../../models/db";
import { materials, courses } from "../../models/schema";
import { eq } from "drizzle-orm";
import supabase from "../../config/supabase";
import { UnauthorizedError, NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

export const createMaterial = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const file = req.file; // من uploadMaterial.single("file")
  const { name } = req.body;
  const rawCourseId = req.body.courseId ?? req.params.courseId;

  if (!file) {
    throw new BadRequest("File is required");
  }

  if (!rawCourseId) {
    throw new BadRequest("courseId is required");
  }

  const courseId = Number(rawCourseId);
  if (Number.isNaN(courseId)) {
    throw new BadRequest("courseId must be a number");
  }

  // تأكد إن الكورس موجود
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId));

  if (!course) {
    throw new NotFound("Course not found");
  }

  // اسم الماتريال
  const materialName = (name || file.originalname).trim();

  // اسم فريد للفايل جوه البكت
  const ext = path.extname(file.originalname) || "";
  const random = crypto.randomBytes(8).toString("hex");
  const fileName = `${Date.now()}-${random}${ext}`;
  const pathInBucket = `course-${courseId}/${fileName}`;

  // رفع الفايل على Supabase Storage (bucket: materials)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("materials")
    .upload(pathInBucket, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError || !uploadData) {
    throw new BadRequest(
      "Upload to Supabase failed: " + (uploadError?.message || "Unknown error")
    );
  }

  // حفظ الريكورد في DB
  const [material] = await db
    .insert(materials)
    .values({
      courseId,
      name: materialName,
      filePath: uploadData.path, // مثال: "course-5/1712...-abcd.pdf"
    })
    .returning();

  // جِب الـ public URL لو البكت Public
  const { data: publicUrlData } = supabase.storage
    .from("materials")
    .getPublicUrl(uploadData.path);

  const fileUrl = publicUrlData?.publicUrl || null;

  return SuccessResponse(
    res,
    {
      message: "Material created successfully",
      data: {
        ...material,
        fileUrl,
      },
    },
    201
  );
};

// ========== GET ALL MATERIALS FOR COURSE ==========
export const getMaterialsByCourse = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const { courseId } = req.params;

  const mats = await db
    .select()
    .from(materials)
    .where(eq(materials.courseId, Number(courseId)));

  const data = mats.map((m) => {
    const { data: publicUrlData } = supabase.storage
      .from("materials")
      .getPublicUrl(m.filePath);

    return {
      ...m,
      fileUrl: publicUrlData.publicUrl,
    };
  });

  return SuccessResponse(res, { data }, 200);
};

// ========== GET ONE MATERIAL BY ID ==========
export const getMaterialById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const { id } = req.params;

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, Number(id)));

  if (!material) {
    throw new NotFound("Material not found");
  }

  const { data: publicUrlData } = supabase.storage
    .from("materials")
    .getPublicUrl(material.filePath);

  const data = {
    ...material,
    fileUrl: publicUrlData.publicUrl,
  };

  return SuccessResponse(res, { data }, 200);
};

// ========== DELETE MATERIAL (DB + Supabase Storage) ==========
export const deleteMaterial = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const { id } = req.params;

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, Number(id)));

  if (!material) {
    throw new NotFound("Material not found");
  }

  // امسح من DB
  await db.delete(materials).where(eq(materials.id, Number(id)));

  // امسح الفايل من Supabase Storage
  await supabase.storage
    .from("materials")
    .remove([material.filePath]);

  return SuccessResponse(res, { message: "Material deleted successfully" }, 200);
};
