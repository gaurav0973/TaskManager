import { Router } from "express";
import { loginUser, registerUser, verifyEmail } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;
