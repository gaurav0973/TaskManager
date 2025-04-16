import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const registerUser = asyncHandler(async (req, res) => {
  
  //1. get user info from frontend
  console.log(req.body); //✅
  const { fullName, email, username, password } = req.body;
  

  // 2. validate the data =>  middleware

  // 3. check if user already exists in the db
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with same email or username already exists");
  }

  // 4. check for avatar image
  let avatarLocalPath;

  // console.log("File : ", req.file); //✅
  
  if (req.file) {
    avatarLocalPath = req.file.path;
  }
  // console.log(avatarLocalPath);  //✅
  

  // 5. upload avatar to cloudinary
  let avatar = {};
  if (avatarLocalPath) {
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!uploadedAvatar) {
      throw new ApiError(400, "Error while uploading avatar");
    }
    avatar = {
      url: uploadedAvatar.url,
      localPath: avatarLocalPath,
    };
  }

  // 6. create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar,
    email,
    password,
    username: username.toLowerCase(),
  });

  // 7. generate email verification token
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save();

  // 8. send verification email
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${process.env.BASE_URL}/api/v1/users/verifyEmail/${unHashedToken}`,
    ),
  });

  //9. return response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user },
        "Users registered successfully and verification email has been sent on your email.",
      ),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  
});

const loginUser = asyncHandler(async (req, res) => {});

const logoutUser = asyncHandler(async (req, res) => {});

const resendEmailVerification = asyncHandler(async (req, res) => {});
const resetForgottenPassword = asyncHandler(async (req, res) => {});

const refreshAccessToken = asyncHandler(async (req, res) => {});

const forgotPasswordRequest = asyncHandler(async (req, res) => {});

const changeCurrentPassword = asyncHandler(async (req, res) => {});

const getCurrentUser = asyncHandler(async (req, res) => {});

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
