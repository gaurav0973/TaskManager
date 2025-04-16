import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register")
        .post(
                upload.single("avatar"),
                userRegisterValidator(), 
                validate, 
                registerUser
        );

export default router;
