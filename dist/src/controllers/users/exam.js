"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExam = exports.updateExam = exports.getExamById = exports.getExams = exports.createExam = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const createExam = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { courseId, date, time, location } = req.body;
    // Validate all required fields are present
    if (!courseId || !date || !time || !location) {
        throw new BadRequest_1.BadRequest("All fields are required");
    }
    // Check if course exists
    const [course] = await db_1.db
        .select()
        .from(schema_1.courses)
        .where((0, drizzle_orm_1.eq)(schema_1.courses.id, Number(courseId)));
    if (!course) {
        throw new Errors_1.NotFound("Course not found");
    }
    // Create exam
    const [exam] = await db_1.db
        .insert(schema_1.exams)
        .values({
        courseId: Number(courseId),
        date,
        time,
        location,
        createdBy: parseInt(userId),
    })
        .returning();
    return (0, response_1.SuccessResponse)(res, { message: "Exam created successfully", data: exam }, 201);
};
exports.createExam = createExam;
const getExams = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const examsList = await db_1.db
        .select()
        .from(schema_1.exams)
        .where((0, drizzle_orm_1.eq)(schema_1.exams.createdBy, parseInt(userId)));
    return (0, response_1.SuccessResponse)(res, { message: "Exams fetched successfully", data: examsList }, 200);
};
exports.getExams = getExams;
const getExamById = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await db_1.db.select().from(schema_1.exams).where((0, drizzle_orm_1.eq)(schema_1.exams.id, parseInt(id)));
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    return (0, response_1.SuccessResponse)(res, { message: "Exam fetched successfully", data: exam });
};
exports.getExamById = getExamById;
const updateExam = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const { courseId, date, time, location } = req.body;
    if (!courseId || !date || !time || !location)
        throw new BadRequest_1.BadRequest("all fields are required");
    const exam = await db_1.db.select().from(schema_1.exams).where((0, drizzle_orm_1.eq)(schema_1.exams.id, parseInt(id)));
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    const updatedExam = await db_1.db.update(schema_1.exams).set({
        courseId,
        date,
        time,
        location,
    }).returning();
    return (0, response_1.SuccessResponse)(res, { message: "Exam updated successfully", data: updatedExam });
};
exports.updateExam = updateExam;
const deleteExam = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await db_1.db.select().from(schema_1.exams).where((0, drizzle_orm_1.eq)(schema_1.exams.id, parseInt(id)));
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    await db_1.db.delete(schema_1.exams).where((0, drizzle_orm_1.eq)(schema_1.exams.id, parseInt(id)));
    return (0, response_1.SuccessResponse)(res, { message: "Exam deleted successfully" });
};
exports.deleteExam = deleteExam;
