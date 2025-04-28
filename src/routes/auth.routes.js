import { Router } from "express";
import { 
    changePasswordValidator,
    resetPasswordValidator,
    userLoginValidator, 
    userRegistrationValidator 
} from "../validators/auth.validator.js"
import {
    changeCurrentPassword,
    forgotPasswordRequest,
    getCurrentUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser,
    resetForgottenPassword,
    verifyEmail
} from "../controllers/auth.controller.js" 
import { validate } from "../middlewares/validator.middleware.js";
import {isLoggedIn} from '../middlewares/auth.middleware.js';

const router = Router();

router.post("/register", userRegistrationValidator(), validate, registerUser);
// agar next() krdenge to explicitly execute krne ki jrurat nhi h
// if we return something or not use next, then we will have to explicitly execute function 
// express/express-validator will pass the data in req body behind the scenes
  
router.post("/login", userLoginValidator(), validate, loginUser);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/reset-password/:token", isLoggedIn, resetPasswordValidator(), validate, resetForgottenPassword);
router.post("/change-password", isLoggedIn, changePasswordValidator(), validate, changeCurrentPassword);

router.get("/logout", isLoggedIn, logoutUser);
router.get("/verify/:token", verifyEmail);
router.get("/forget-password", isLoggedIn, forgotPasswordRequest);
router.get("/my-profile", isLoggedIn, getCurrentUser);

export default router 