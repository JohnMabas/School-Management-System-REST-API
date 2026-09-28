const AppError = require("../utils/AppError");

/** Turns body-parser failures (malformed JSON, oversized payloads) into API errors. */
function normalise(error) {
  if (error.type === "entity.parse.failed") {
    return new AppError("Request body is not valid JSON.", 400);
  }
  if (error.type === "entity.too.large") {
    return new AppError("Request body is too large.", 413);
  }
  return error;
}

module.exports = function errorHandler(error, req, res, _next) {
  const err = normalise(error);
  const isOperational = err.isOperational === true;
  const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode <= 599
    ? err.statusCode
    : 500;

  if (!isOperational) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : "Something went wrong. Please try again later.",
    ...(isOperational && err.errors ? { errors: err.errors } : {}),
  });
};
