import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import PlansRoute from "./plans";
import AuthRoute from "./auth";
import CourseRoute from "./course";
import MaterialsRoute from "./matrials";
import { Router } from "express";

const route = Router();
route.use("/auth", AuthRoute);
route.use(
  authenticated,
  authorizeRoles("user"),
);
route.use("/course", CourseRoute);
route.use("/materials", MaterialsRoute);
route.use("/plans", PlansRoute);
export default route;
