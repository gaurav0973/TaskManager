import { Router } from "express";
import { 
    changeCurrentPassword,
    getCurrentUser, 
    loginUser, 
    logoutUser, 
    registerUser, 
    resendEmailVerification, 
    verifyEmail 
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userChangeCurrentPasswordValidator, userLoginValidator, userRegisterValidator } from "../validators/index.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/isLoggedin.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"),userRegisterValidator(),validate,registerUser)
router.get("/verifyEmail/:token", verifyEmail)
router.route("/resend-verification-email").post(resendEmailVerification)
router.route("/login").post(userLoginValidator(),validate,loginUser)
router.get("/get-profile", isLoggedIn, getCurrentUser)
router.route("/logout").get(isLoggedIn, logoutUser)
router.route("/change-password").post(isLoggedIn, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)

export default router;
