import { Router } from "express";
import { createExam, getExams, getExamById, updateExam, deleteExam } from "../../controllers/users/exam";
import { createExamSchema, updateExamSchema } from "../../validators/users/exam";
import { validate } from "../../middlewares/validation";
import { catchAsync } from "../../utils/catchAsync";

const route = Router();

route.post("/", validate(createExamSchema), catchAsync(createExam));
route.get("/", catchAsync(getExams));
route.get("/:id", catchAsync(getExamById));
route.put("/:id", validate(updateExamSchema), catchAsync(updateExam));
route.delete("/:id", catchAsync(deleteExam));

export default route;