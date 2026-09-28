const { parse, PASSWORD_MAX } = require("./schema");
const { users } = require("../data/users");
const { classes } = require("../data/classes");
const { subjects } = require("../data/subjects");

const PUBLIC_ROLES = ["student", "teacher"];

const registerSchema = {
  name: { type: "string", required: true, min: 2, max: 80 },
  email: { type: "email", required: true, unique: { collection: () => users, message: "email is already registered." } },
  password: { type: "password", required: true },
  role: { type: "enum", values: PUBLIC_ROLES, default: "student", label: "role" },
  phone: { type: "phone" },
  classId: { type: "ref", collection: () => classes, entity: "class", label: "classId" },
  subjectId: { type: "ref", collection: () => subjects, entity: "subject", label: "subjectId" },
};

const loginSchema = {
  email: { type: "email", required: true },
  password: { type: "string", required: true, min: 1, max: PASSWORD_MAX },
};

exports.register = (body) => parse(body, registerSchema);
exports.login = (body) => parse(body, loginSchema);
