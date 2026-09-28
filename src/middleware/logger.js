/** Logs one line per request: method, url, status code and timestamp. */
module.exports = function logger(req, res, next) {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode}`
    );
  });

  next();
};
