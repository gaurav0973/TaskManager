import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser, verifyEmail } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/isLoggedin.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    upload.single("avatar"),
    userRegisterValidator(),
    validate,
    registerUser,
  );
router.get("/verifyEmail/:token", verifyEmail)
router.route("/login")
  .post(
    userLoginValidator(),validate,
    loginUser,
  );

router.get("/get-profile", isLoggedIn, getCurrentUser)
router.route("/logout")
  .get(isLoggedIn, logoutUser);


export default router;
