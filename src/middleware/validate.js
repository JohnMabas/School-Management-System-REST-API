const BINDINGS = {
  body: "validatedBody",
  params: "validatedParams",
  query: "validatedQuery",
};

/** Runs a validator from the schema layer and exposes the sanitised result on the request. */
function validate(validatorFn, source = "body") {
  return function (req, _res, next) {
    try {
      const parsed = validatorFn(req[source], req);
      req[BINDINGS[source]] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validate;
