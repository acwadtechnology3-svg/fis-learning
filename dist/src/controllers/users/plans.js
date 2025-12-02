"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.getPlanById = exports.getPlans = exports.createPlan = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const createPlan = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { title, startDate, endDate, courseId, type } = req.body;
    // Validate all required fields are present
    if (!title || !startDate || !endDate || !courseId || !type) {
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
    // Create plan
    const [plan] = await db_1.db
        .insert(schema_1.plans)
        .values({
        title,
        startDate,
        endDate,
        courseId: Number(courseId),
        type,
        createdBy: parseInt(userId),
    })
        .returning();
    return (0, response_1.SuccessResponse)(res, { message: "Plan created successfully", data: plan }, 201);
};
exports.createPlan = createPlan;
const getPlans = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const plansList = await db_1.db
        .select()
        .from(schema_1.plans)
        .where((0, drizzle_orm_1.eq)(schema_1.plans.createdBy, parseInt(userId)));
    return (0, response_1.SuccessResponse)(res, { message: "Plans fetched successfully", data: plansList }, 200);
};
exports.getPlans = getPlans;
const getPlanById = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    const [plan] = await db_1.db
        .select()
        .from(schema_1.plans)
        .where((0, drizzle_orm_1.eq)(schema_1.plans.id, Number(id)));
    if (!plan) {
        throw new Errors_1.NotFound("Plan not found");
    }
    // Optional: Verify the plan belongs to the user (for security)
    if (plan.createdBy !== parseInt(userId)) {
        throw new Errors_1.UnauthorizedError("You don't have access to this plan");
    }
    return (0, response_1.SuccessResponse)(res, { message: "Plan fetched successfully", data: plan }, 200);
};
exports.getPlanById = getPlanById;
const updatePlan = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    const { title, startDate, endDate, courseId, type } = req.body;
    // Check if plan exists and belongs to user
    const [plan] = await db_1.db
        .select()
        .from(schema_1.plans)
        .where((0, drizzle_orm_1.eq)(schema_1.plans.id, Number(id)));
    if (!plan) {
        throw new Errors_1.NotFound("Plan not found");
    }
    // Verify the plan belongs to the user
    if (plan.createdBy !== parseInt(userId)) {
        throw new Errors_1.UnauthorizedError("You don't have access to this plan");
    }
    // If courseId is being updated, verify the course exists
    if (courseId && courseId !== plan.courseId) {
        const [course] = await db_1.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.eq)(schema_1.courses.id, Number(courseId)));
        if (!course) {
            throw new Errors_1.NotFound("Course not found");
        }
    }
    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined)
        updateData.title = title;
    if (startDate !== undefined)
        updateData.startDate = startDate;
    if (endDate !== undefined)
        updateData.endDate = endDate;
    if (courseId !== undefined)
        updateData.courseId = Number(courseId);
    if (type !== undefined)
        updateData.type = type;
    // Update the plan
    const [updatedPlan] = await db_1.db
        .update(schema_1.plans)
        .set(updateData)
        .where((0, drizzle_orm_1.eq)(schema_1.plans.id, Number(id)))
        .returning();
    return (0, response_1.SuccessResponse)(res, { message: "Plan updated successfully", data: updatedPlan }, 200);
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    // Check if plan exists
    const [plan] = await db_1.db
        .select()
        .from(schema_1.plans)
        .where((0, drizzle_orm_1.eq)(schema_1.plans.id, Number(id)));
    if (!plan) {
        throw new Errors_1.NotFound("Plan not found");
    }
    // Verify the plan belongs to the user
    if (plan.createdBy !== parseInt(userId)) {
        throw new Errors_1.UnauthorizedError("You don't have access to this plan");
    }
    // Delete the plan
    await db_1.db
        .delete(schema_1.plans)
        .where((0, drizzle_orm_1.eq)(schema_1.plans.id, Number(id)));
    return (0, response_1.SuccessResponse)(res, { message: "Plan deleted successfully" }, 200);
};
exports.deletePlan = deletePlan;
