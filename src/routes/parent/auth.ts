import { Router } from "express";
import { parentLogin,parentSignup,resendParentCode,verifyParent} from "../../controllers/parent/auth";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { loginparentSchema, parentSignupSchema, verifyParentSchema, resendParentCodeSchema } from "../../validators/parent/auth";

const route = Router();


route.post("/signup", validate(parentSignupSchema), catchAsync(parentSignup));
route.post("/verify", validate(verifyParentSchema), catchAsync(verifyParent));
route.post("/login", validate(loginparentSchema), catchAsync(parentLogin));
route.post("/resend-code", validate(resendParentCodeSchema), catchAsync(resendParentCode));


export default route;

