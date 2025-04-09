import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) 
    return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})



userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}


// access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  )
}


// refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  )
}


// email verification token
userSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex")

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex")
  
  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes;

  return { unHashedToken, hashedToken, tokenExpiry }
}

export const User = mongoose.model("User", userSchema)
