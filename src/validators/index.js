import { body } from "express-validator";

const userRegistrationValidator = () => {
  console.log(body);
  
    return [
        body("email")
          .trim()
          .notEmpty().withMessage("Email is required")
          .isEmail().withMessage("Invalid Email"),
        body("username")
          .trim()
          .notEmpty().withMessage("Username is required")
          .isLength({min : 3}).withMessage("username should be atleast of 3 char")
          .isLength({ max:13}).withMessage("username cannot exceed 13 char"),
        body("fullName")
          .trim()
          .isEmpty().withMessage("fullname is required"),
        body("password")
          .trim()
          .isEmpty().withMessage("password is required")
          .isLength({min:6}).withMessage("password length should be more than 5")
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }).withMessage("please enter a strong password")
    ];
}
 
const userLoginValidator = () => {
    return [
        body("email")
          .trim()
          .notEmpty().withMessage("Email is required")
          .isEmail().withMessage("Email is not valid"),
        body("password")
          .trim()
          .isEmpty().withMessage("Password is required"),
    ];
}

export {userRegistrationValidator, userLoginValidator};