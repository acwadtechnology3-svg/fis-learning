import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import AuthRoute from "./auth";
import { Router } from "express";
import multer from "multer";
const upload = multer();
const route = Router();
route.use(upload.none());
route.use("/auth", AuthRoute);
route.use(
  authenticated,
);

export default route;
