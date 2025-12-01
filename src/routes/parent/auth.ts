import { Router } from "express";
import { parentLogin,parentSignup,resendParentCode,verifyParent} from "../../controllers/parent/auth";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";

const route = Router();


route.post("/signup", catchAsync(parentSignup));
route.post("/verify", catchAsync(verifyParent));
route.post("/login", catchAsync(parentLogin));
route.post("/resend-code", catchAsync(resendParentCode));


export default route;
