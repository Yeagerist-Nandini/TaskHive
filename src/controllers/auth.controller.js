import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}


const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullname } = req.body;

  //check for existing user
  const existing_user = await User.findOne({ email });
  if (existing_user) {
    throw new ApiError(404, 'User already exists');
  }
  //save user to database 
  const user = await User.create({
    email,
    username,
    password,
    fullname
  });

  if (!user) {
    throw new ApiError(400, "User registration failed");
  }

  //generate verification token 
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpiry = Date.now() + (20 * 60 * 1000);
  await user.save();

  //send it through mail
  const emailVerificationUrl = `${process.env.BASE_URL}:${process.env.PORT}/api/v1/verify/${emailVerificationToken}`

  const mailOptions = {
    email: user.email,
    subject: "Email Verification",
    mailgenContent: emailVerificationMailgenContent(user.username, emailVerificationUrl)
  }
  sendEmail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user registration successfull"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //get user ,check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "Invalid email or password");
  }

  //check password
  const isPasswordMatching = await bcrypt.compare(password, user.password);
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!isPasswordMatching) {
    throw new ApiError(400, "Invalid email or password")
  }

  //check if user verified
  if (!user.isEmailVerified) {
    throw new ApiError(400, "User is not verified");
  }

  //get access token 
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

  //save the token in cookie
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, user, "User login successfully"))
});


const logoutUser = asyncHandler(async (req, res) => {
  //check if user if logged in 
  //clear the cookies to logout 
  // console.log(req.user);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1 // this removes the field from document
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
});


const verifyEmail = asyncHandler(async (req, res) => {
  const {token} = req.params;
  if (!token) {
    throw new ApiError(400, "Invalid verification token");
  }

  //validation
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid verification token")
  }

  user.isEmailVerified = true;

  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user._id, "Email verification successfull"));
});


const resetForgottenPassword = asyncHandler(async (req, res) => {
  //validate token 
  const {token} = req.params;
  if (!token) {
    throw new ApiError(400, "Invalid token")
  }

  //get user
  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) throw new ApiError(404, "Invalid token")

  // reset password
  user.password = req.body.password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user._id, "New password created successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  //get refresh token
  const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!oldRefreshToken) throw new ApiError(401, "unauthorized request");

  // get payload from token
  const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  //check if user exists
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token")
  }

  //check if refresh token is expired 
  if (oldRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  //get new accesstoken, refresh token 
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

  // save it in cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"))
});


const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  //check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //get token
  const token = crypto.randomBytes(32).toString("hex");

  //set reset password fields in DB
  user.forgotPasswordToken = token;
  user.forgotPasswordExpiry = Date.now() + (20 * 60 * 1000);
  await user.save();

  //send email for reset password
  const resetPasswordUrl = `${process.env.BASE_URL}:${process.env.PORT}/api/v1/reset-password/${token}`

  const mailOptions = {
    email: user.email,
    subject: "Reset Your Password",
    mailgenContent: forgotPasswordMailgenContent(user.username, resetPasswordUrl)
  }
  sendEmail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, resetPasswordUrl, "Reset password link sent to your email."))
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { password, new_password } = req.body;

  //check if user is logged in 
  const userId = req.user._id;

  //check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check if old password is matching
  const isPasswordMatching = await bcrypt.compare(password, user.password);
  if (!isPasswordMatching) {
    throw new ApiError(400, "Invalid password");
  }

  //change the password
  user.password = new_password;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password changed successfully!"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
  //check if user is logged in and get userid
  const userid = req.user._id;

  const user = await User.findById(userid).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Fetched current user successfully"));
});


const resendEmailVerification = asyncHandler(async (req, res) => {
  verifyEmail(req, res);
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
