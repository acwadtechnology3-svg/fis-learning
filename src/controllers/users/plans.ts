import { Request, Response } from "express";
import { db } from "../../models/db";
import { courses, plans } from "../../models/schema";
import { eq } from "drizzle-orm";
import { UnauthorizedError, NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

export const createPlan = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const { title, startDate, endDate, courseId, type } = req.body;
    
    // Validate all required fields are present
    if (!title || !startDate || !endDate || !courseId || !type) {
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
    
    // Create plan
    const [plan] = await db
        .insert(plans)
        .values({
            title,
            startDate,
            endDate,
            courseId: Number(courseId),
            type,
            createdBy: parseInt(userId),
        })
        .returning();
    
    return SuccessResponse(
        res,
        { message: "Plan created successfully", data: plan },
        201
    );
};


export const getPlans = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const plansList = await db
        .select()
        .from(plans)
        .where(eq(plans.createdBy, parseInt(userId)));
    
    return SuccessResponse(
        res,
        { message: "Plans fetched successfully", data: plansList },
        200
    );
};


export const getPlanById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const { id } = req.params;
    
    const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, Number(id)));
    
    if (!plan) {
        throw new NotFound("Plan not found");
    }
    
    // Optional: Verify the plan belongs to the user (for security)
    if (plan.createdBy !== parseInt(userId)) {
        throw new UnauthorizedError("You don't have access to this plan");
    }
    
    return SuccessResponse(
        res,
        { message: "Plan fetched successfully", data: plan },
        200
    );
};

export const updatePlan = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const { id } = req.params;
    const { title, startDate, endDate, courseId, type } = req.body;
    
    // Check if plan exists and belongs to user
    const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, Number(id)));
    
    if (!plan) {
        throw new NotFound("Plan not found");
    }
    
    // Verify the plan belongs to the user
    if (plan.createdBy !== parseInt(userId)) {
        throw new UnauthorizedError("You don't have access to this plan");
    }
    
    // If courseId is being updated, verify the course exists
    if (courseId && courseId !== plan.courseId) {
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, Number(courseId)));
        
        if (!course) {
            throw new NotFound("Course not found");
        }
    }
    
    // Build update object with only provided fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (courseId !== undefined) updateData.courseId = Number(courseId);
    if (type !== undefined) updateData.type = type;
    
    // Update the plan
    const [updatedPlan] = await db
        .update(plans)
        .set(updateData)
        .where(eq(plans.id, Number(id)))
        .returning();
    
    return SuccessResponse(
        res,
        { message: "Plan updated successfully", data: updatedPlan },
        200
    );
};

export const deletePlan = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
    
    const { id } = req.params;
    
    // Check if plan exists
    const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, Number(id)));
    
    if (!plan) {
        throw new NotFound("Plan not found");
    }
    
    // Verify the plan belongs to the user
    if (plan.createdBy !== parseInt(userId)) {
        throw new UnauthorizedError("You don't have access to this plan");
    }
    
    // Delete the plan
    await db
        .delete(plans)
        .where(eq(plans.id, Number(id)));
    
    return SuccessResponse(
        res,
        { message: "Plan deleted successfully" },
        200
    );
};
