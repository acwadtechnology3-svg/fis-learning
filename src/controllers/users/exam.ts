import { Request, Response } from "express";
import { db } from "../../models/db";
import { courses, exams } from "../../models/schema";
import { eq } from "drizzle-orm";
import { UnauthorizedError, NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

export const createExam = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const { courseId, date, time, location } = req.body;
    
    // Validate all required fields are present
    if (!courseId || !date || !time || !location) {
        throw new BadRequest("All fields are required");
    }
    
    // Check if course exists
    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, Number(courseId)));
    
    if (!course) {
        throw new NotFound("Course not found");
    }
    
    // Create exam
    const [exam] = await db
        .insert(exams)
        .values({
            courseId: Number(courseId),
            date,
            time,
            location,
            createdBy: parseInt(userId),
        })
        .returning();
    
    return SuccessResponse(
        res,
        { message: "Exam created successfully", data: exam },
        201
    );
};

export const getExams = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const examsList = await db
        .select()
        .from(exams)
        .where(eq(exams.createdBy, parseInt(userId)));
    
    return SuccessResponse(
        res,
        { message: "Exams fetched successfully", data: examsList },
        200
    );
};

export const getExamById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id) throw new BadRequest("Exam ID is required");
    const exam = await db.select().from(exams).where(eq(exams.id, parseInt(id)));
    if (!exam) throw new NotFound("Exam not found");
    return SuccessResponse(res, {message: "Exam fetched successfully", data: exam});
};

export const updateExam = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id) throw new BadRequest("Exam ID is required");
    const { courseId, date, time, location } = req.body;
    if (!courseId||!date||!time||!location) throw new BadRequest("all fields are required");
    const exam = await db.select().from(exams).where(eq(exams.id, parseInt(id)));
    if (!exam) throw new NotFound("Exam not found");
    const updatedExam = await db.update(exams).set({
        courseId,
        date,
        time,
        location,
    }).returning();
    return SuccessResponse(res, {message: "Exam updated successfully", data: updatedExam});
};

export const deleteExam = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id) throw new BadRequest("Exam ID is required");
    const exam = await db.select().from(exams).where(eq(exams.id, parseInt(id)));
    if (!exam) throw new NotFound("Exam not found");
    await db.delete(exams).where(eq(exams.id, parseInt(id)));
    return SuccessResponse(res, {message: "Exam deleted successfully"});
};
