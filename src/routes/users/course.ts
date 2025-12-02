import { Router } from "express";
import { getCourses, createCourse, updateCourse, deleteCourse, getCourseById } from "../../controllers/users/course";
import { authenticated } from "../../middlewares/authenticated";
import { validate } from "../../middlewares/validation";
import { createCourseSchema, updateCourseSchema } from "../../validators/users/course";
import {catchAsync} from "../../utils/catchAsync";
const route = Router();

route.get("/",  catchAsync(getCourses));
route.post("/", validate(createCourseSchema), catchAsync(createCourse));
route.get("/:id", catchAsync(getCourseById));
route.put("/:id", validate(updateCourseSchema), catchAsync(updateCourse));
route.delete("/:id", catchAsync(deleteCourse));
export default route;