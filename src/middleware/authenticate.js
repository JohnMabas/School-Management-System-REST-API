const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { findById } = require("../data/users");
const { jwtSecret } = require("../config/env");

/**
 * 1. reads the Bearer token
 * 2. verifies its signature and expiry
 * 3. reloads the account so revoked/deleted users lose access immediately
 * 4. attaches the identity to req.user
 */
module.exports = function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated. Provide a Bearer token.", 401));
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return next(new AppError("Not authenticated. Provide a Bearer token.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token.", 401));
  }

  const user = findById(decoded.id);

  if (!user) {
    return next(new AppError("This account no longer exists.", 401));
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    teacherId: user.teacherId,
  };

  return next();
};
