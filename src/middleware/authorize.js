const AppError = require("../utils/AppError");

/** Route-level guard: `router.delete("/:id", authorize("admin"), handler)`. */
module.exports = function authorize(...allowedRoles) {
  return function (req, _res, next) {
    if (!req.user) {
      return next(new AppError("Not authenticated. Please log in.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Forbidden. Your role (${req.user.role}) cannot perform this action.`, 403)
      );
    }

    return next();
  };
};
