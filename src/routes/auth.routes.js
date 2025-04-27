import { Router } from "express";
import { userRegistrationValidator } from "../validators/index.js"
import {registerUser} from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validator.middleware.js";
import {isLoggedIn} from '../middlewares/auth.middleware.js';

const router = Router();

router.post("/register", userRegistrationValidator(), validate, registerUser);
// agar next() krdenge to explicitly execute krne ki jrurat nhi h
// if we return something or not use next, then we will have to explicitly execute function 
// express/express-validator will pass the data in req body behind the scenes

export default router 