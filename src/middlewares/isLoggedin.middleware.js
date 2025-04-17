import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { generateAccessAndRefreshToken } from "../utils/generate-access-refresh.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new ApiError(401, "Please login first");
    }

    if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id);
      
      if (!user) {
        throw new ApiError(401, "Invalid access token");
      }

      req.user = user;
      req.userId = user._id;
      return next();
    }

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded._id);
      
      if (!user || refreshToken !== user.refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Generate new tokens
      const { accessToken: newAccess, refreshToken: newRefresh } = 
        await generateAccessAndRefreshToken(user._id);

      // Set new cookies
      res.cookie("accessToken", newAccess, {
        httpOnly: true,
        secure: true
      });
      res.cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: true
      });

      req.user = user;
      req.userId = user._id;
      return next();
    }

  } catch (error) {
    // Clear cookies on error
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    next(new ApiError(401, "Invalid token - Please login again"));
  }
};

export { isLoggedIn };
