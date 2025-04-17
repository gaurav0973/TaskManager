import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import { generateAccessAndRefreshToken } from "../utils/generate-access-refresh.js";

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
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save();

  // 8. send verification email
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${process.env.BASE_URL}/api/v1/users/verifyEmail/${hashedToken}`,
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
  // 1. get the token
  const token = req.params.token;
  console.log(token);

  try {
    // 2. find the user with the verification token in DB
    const user = await User.findOne({ emailVerificationToken: token });
    // 3. check if user exists
    if (!user) {
      throw new ApiError(400, "Invalid verification token");
    }

    // 4. check if token is expired
    if (Date.now() > user.emailVerificationExpiry) {
      throw new ApiError(400, "Token has expired");
    }
    // 4. Check if the email is already verified
    if (user.isEmailVerified) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is already verified"));
    }
    // 5. update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // 6. send response
    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "Email verified successfully"));
  } catch (error) {
    throw new ApiError(400, "Email Verification Failed");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("LoginStarts : ", req.body);

  try {
    // 1. get the user from the database
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "Invalid Email or Password");
    }

    // 2. verify user's email
    if (!user.isEmailVerified) {
      throw new ApiError(400, "Please verify your email first");
    }

    // 3. validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid Email or Password");
    }

    // 4. generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 5. set cookies
    const options = {
      httpOnly: true,
      secure: true,
    };
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);

    // 6 send response
    return res.status(200).json(
      new ApiResponse(200,{user},"Logged in Successfully",))
  }
  catch (error) {
    throw new ApiError(400, "Login Failed");
  }
});


const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const user = req.user;
    return res.status(200)
        .json(new ApiResponse(200, user, "User Fetched Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {});

const resendEmailVerification = asyncHandler(async (req, res) => {});
const resetForgottenPassword = asyncHandler(async (req, res) => {});

const refreshAccessToken = asyncHandler(async (req, res) => {});

const forgotPasswordRequest = asyncHandler(async (req, res) => {});

const changeCurrentPassword = asyncHandler(async (req, res) => {});

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
