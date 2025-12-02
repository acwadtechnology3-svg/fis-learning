import { Router } from "express";
import { createPlan, getPlans, getPlanById, updatePlan, deletePlan } from "../../controllers/users/plans";
import { createPlanSchema, updatePlanSchema } from "../../validators/users/plans";
import { validate } from "../../middlewares/validation";
import { catchAsync } from "../../utils/catchAsync";

const route = Router();

route.post("/", validate(createPlanSchema), catchAsync(createPlan));
route.get("/", catchAsync(getPlans));
route.get("/:id", catchAsync(getPlanById));
route.put("/:id", validate(updatePlanSchema), catchAsync(updatePlan));
route.delete("/:id", catchAsync(deletePlan));

export default route;