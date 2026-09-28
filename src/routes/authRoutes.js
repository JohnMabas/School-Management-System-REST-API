const express = require("express");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const { authLimiter } = require("../middleware/rateLimiter");
const { register, login, me } = require("../controllers/authController");
const { register: validateRegister, login: validateLogin } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", authLimiter, validate(validateRegister), register);
router.post("/login", authLimiter, validate(validateLogin), login);

router.get("/me", authenticate, me);

module.exports = router;
