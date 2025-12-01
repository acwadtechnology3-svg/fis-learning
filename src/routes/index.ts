import { Router } from "express";
import usersRoute from "./users";
import parentRoute from "./parent";
import adminRoute from "./admins";
const route = Router();
route.use("/users", usersRoute);
route.use("/admin", adminRoute);
route.use("/parent", parentRoute);
export default route;

