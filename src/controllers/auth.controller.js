import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"  

/////////////////////////////////////////TODO: WRITE VALIDATIONS FOR FUNCTIONS 

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role, fullname } = req.body;

  //validation 

  const existing_user = await User.findOne({email});
  if(existing_user){
    throw ApiError(404,'User already exists');
  }
  //save user to database 
  const user = await User.create({
    email, 
    username, 
    password, 
    fullname
  });

  //generate verification token 
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpiry = Date.now() + (20 * 60 * 1000);
  await user.save();
  
  //send it through mail
  const emailVerificationUrl = `${process.env.BASE_URL}/api/v1/user/verify/${emailVerificationToken}`

  const mailOptions = {
    email: user.email,
    subject:"Email Verification",
    mailgenContent: emailVerificationMailgenContent(user.username,emailVerificationUrl)
  }
  sendEmail(mailOptions);
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  //validation
  //get user ,check if user exists
  const user = await User.findOne({email});
  if(!user){
    throw new ApiError(404,"Invalid username or password");
  }
  
  //check password
  const isPasswordMatching = await bcrypt.compare(password,user.password);
  const hashedPassword = await bcrypt.hash(password, 10);
  if(hashedPassword !== user.password){
    throw new ApiError(400, "Invalid username or password")
  }

  //check if user verified
  if(!user.isEmailVerified){
    throw new ApiError(400, "User is not verified");
  }

  //get access token 
  const access_token = jwt.sign(
    {_id: user._id},
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: '24h',
    }
  )

  //save the token in cookie
  const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24*60*60*1000  //in millisecs (1 day)
  }
  req.cookie("access_token", access_token, cookieOptions);
});

const logoutUser = asyncHandler(async (req, res) => {
    //check if user if logged in 
    //clear the cookies to logout 
    res.cookie('access_token','',{
        expires: new Date(0)
    })
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params;
  if(!token){
    throw new ApiError(400, "Invalid verification token");
  }

  //validation
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: {$gt: Date.now()}
  });

  if(!user){
    throw new ApiError(400, "Invalid verification token")
  }

  user.isEmailVerified = true;
  
  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  await user.save();

});


const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  verifyEmail(req,res);
});


const resetForgottenPassword = asyncHandler(async (req, res) => {
    //validate token 
   const token = req.params;
   if(!token){
      throw new ApiError(400,"Invalid token")
   }

   //get user
   const user = await User.findOne({
     forgotPasswordToken: token,
     forgotPasswordExpiry: {$gt: Date.now()}
   });

   if(!user) throw new ApiError(404, "Invalid token")

    // reset password
   user.password = req.body.password;
   user.forgotPasswordExpiry= undefined;
   user.forgotPasswordToken = undefined;
   await user.save();
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});


const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const userid = req.user._id;

  //check if user exists
  const user = await User.findById(userid);
  if(!user){
    throw new ApiError(404, "User not found");
  }
  
  //get token
  const token = crypto.randomBytes(32).toString("hex");
  //set reset password fields in DB
  user.forgotPasswordToken = token;
  user.forgotPasswordExpiry = Date.now() + (20 * 60 * 1000);
  await user.save();
  
  //send email for reset password
  const resetPasswordUrl = `${process.env.BASE_URL}/api/v1/user/forgot-password/${token}`

  const mailOptions = {
    email: user.email,
    subject: "Reset Your Password",
    mailgenContent: forgotPasswordMailgenContent(user.username, resetPasswordUrl)
  }
  sendEmail(mailOptions);
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { password, new_password } = req.body;

  //check if user is logged in 
  const userid = req.user._id;

  //check if user exists
  const user = await User.findById(userid);
  if(!user){
    throw new ApiError(404, "You are not logged in");
  }

  // check if old password is matching
  const isPasswordMatching = await bcrypt.compare(password,user.password);
  if(!isPasswordMatching){
    throw new ApiError(400, "Invalid password");
  }

  //change the password
  user.password = new_password;
  await user.save();
});


const getCurrentUser = asyncHandler(async (req, res) => {
  //check if user is logged in and get userid
  const userid = req.user._id;

  const user = await User.findById(userid);
  if(!user){
    throw new ApiError(404, "User not found")
  }
});


export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
