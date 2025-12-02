import { Request, Response } from "express";
import { db } from "../../models/db";
import { courses } from "../../models/schema";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { UnauthorizedError} from "../../Errors";
import { eq } from "drizzle-orm";

export const getCourses = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError("Unauthorized");
    }

    const coursesList = await db.select().from(courses).where(eq(courses.createdBy, parseInt(userId)));
    return SuccessResponse(res, coursesList, 200);
}

export const createCourse = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }
  
    const { name } = req.body;
  
    const [course] = await db
      .insert(courses)
      .values({ name, createdBy: parseInt(userId) })
      .returning(); // هنا السحر
  
    return SuccessResponse(res, {
      message: "Course created successfully",
      data: course,
    }, 201);
  };
  
  
  export const updateCourse = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");
  
    const { id } = req.params;
    const { name } = req.body;
    const course = await db.update(courses).set({ name }).where(eq(courses.id, parseInt(id))).returning();
    return SuccessResponse(res, {
        message: "Course created successfully",
        data: course,
      }, 201);
  }
  
export const deleteCourse = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError("Unauthorized");
    }
    const { id } = req.params;
    const course = await db.delete(courses).where(eq(courses.id, parseInt(id)));
    return SuccessResponse(res, course, 200);
}

export const getCourseById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError("Unauthorized");
    }
    const { id } = req.params;
    const course = await db.select().from(courses).where(eq(courses.id, parseInt(id)));
    return SuccessResponse(res, course, 200);
}
