import { asyncHandler } from "../utils/async-handler.js";
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;
});

const verifyEmail = asyncHandler(async (req, res) => {
  
});

const loginUser = asyncHandler(async (req, res) => {
  
});

const logoutUser = asyncHandler(async (req, res) => {
  
});


const resendEmailVerification = asyncHandler(async (req, res) => {
  
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  
});

const refreshAccessToken = asyncHandler(async (req, res) => {

});

const forgotPasswordRequest = asyncHandler(async (req, res) => {

});

const changeCurrentPassword = asyncHandler(async (req, res) => {
 
});

const getCurrentUser = asyncHandler(async (req, res) => {

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
