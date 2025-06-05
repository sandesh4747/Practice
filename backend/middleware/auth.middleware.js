import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes – only accessible with a valid access token
export const protectRoute = async (req, res, next) => {
  try {
    // Get access token from cookies
    const accessToken = req.cookies.accessToken;

    // If no token is present, deny access
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorzied - No access token provided" });
    }

    try {
      // Verify the access token using JWT
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      // Fetch the user associated with the token (excluding the password)
      const user = await User.findById(decoded.userId).select("-password");

      // If user not found, deny access
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Attach user data to the request object for future use
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);

    return res
      .status(401)
      .json({ message: "Unauthorized  - Invalid access token" });
  }
};

// Middleware to restrict access to admin users only
export const adminRoute = (req, res, next) => {
  // Check if user exists and has the admin role
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied - Admin only" });
  }
};
