const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "FATAL ERROR: JWT_SECRET must be set in .env and at least 32 characters long. " +
      "Copy .env.example to .env and generate a secret with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  bcryptRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  nodeEnv: process.env.NODE_ENV || "development",
};
