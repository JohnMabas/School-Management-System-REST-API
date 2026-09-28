const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const { jwtSecret, jwtExpiresIn, bcryptRounds } = require("../config/env");
const { findByEmail, createUser, toPublicUser } = require("../data/users");
const { students } = require("../data/students");
const { teachers } = require("../data/teachers");

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

/**
 * Registration also provisions the matching school record so a logged in
 * student/teacher is immediately linked to their profile and results.
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, classId, subjectId } = req.validatedBody;

  const user = createUser({
    name,
    email,
    password: await bcrypt.hash(password, bcryptRounds),
    role,
    studentId: null,
    teacherId: null,
  });

  if (role === "student") {
    const student = students.create({ name, email, phone, classId: classId || null, userId: user.id });
    user.studentId = student.id;
  }

  if (role === "teacher") {
    const teacher = teachers.create({ name, email, phone, subjectId: subjectId || null, userId: user.id });
    user.teacherId = teacher.id;
  }

  created(res, "Registered successfully.", { user: toPublicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const user = findByEmail(email);
  const invalidCredentials = new AppError("Invalid email or password.", 401);

  // The same message and hashing work are used for both failure paths so the
  // response cannot be used to discover which emails are registered.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw invalidCredentials;
  }

  ok(res, "Login successful.", { token: signToken(user), user: toPublicUser(user) });
});

/** Convenience endpoint so any authenticated role can read its own identity. */
exports.me = asyncHandler(async (req, res) => {
  const { id, name, email, role, studentId, teacherId } = req.user;

  let profile = null;
  if (role === "student" && studentId) profile = students.findById(studentId);
  if (role === "teacher" && teacherId) profile = teachers.findById(teacherId);

  ok(res, "Authenticated user.", { user: { id, name, email, role, studentId, teacherId }, profile });
});
