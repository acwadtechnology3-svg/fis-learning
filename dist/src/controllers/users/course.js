"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseById = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourses = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const drizzle_orm_1 = require("drizzle-orm");
const getCourses = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new Errors_1.UnauthorizedError("Unauthorized");
    }
    const coursesList = await db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.createdBy, parseInt(userId)));
    return (0, response_1.SuccessResponse)(res, coursesList, 200);
};
exports.getCourses = getCourses;
const createCourse = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new Errors_1.UnauthorizedError("Unauthorized");
    }
    const { name } = req.body;
    const [course] = await db_1.db
        .insert(schema_1.courses)
        .values({ name, createdBy: parseInt(userId) })
        .returning(); // هنا السحر
    return (0, response_1.SuccessResponse)(res, {
        message: "Course created successfully",
        data: course,
    }, 201);
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    const { name } = req.body;
    const course = await db_1.db.update(schema_1.courses).set({ name }).where((0, drizzle_orm_1.eq)(schema_1.courses.id, parseInt(id))).returning();
    return (0, response_1.SuccessResponse)(res, {
        message: "Course created successfully",
        data: course,
    }, 201);
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new Errors_1.UnauthorizedError("Unauthorized");
    }
    const { id } = req.params;
    const course = await db_1.db.delete(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.id, parseInt(id)));
    return (0, response_1.SuccessResponse)(res, course, 200);
};
exports.deleteCourse = deleteCourse;
const getCourseById = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new Errors_1.UnauthorizedError("Unauthorized");
    }
    const { id } = req.params;
    const course = await db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.id, parseInt(id)));
    return (0, response_1.SuccessResponse)(res, course, 200);
};
exports.getCourseById = getCourseById;
