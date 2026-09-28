const { createCollection } = require("./store");

const users = createCollection([
  {
    id: 1,
    name: "System Administrator",
    email: "admin@school.test",
    password: "$2a$10$AIRhRpKbJyO4H.DaUlkM4eVn7DkQ/ohJwRn9zIQtVSFMxv3UMFOGy",
    role: "admin",
    studentId: null,
    teacherId: null,
    createdAt: "2025-09-01T07:00:00.000Z",
  },
  {
    id: 2,
    name: "Bello Adamu",
    email: "teacher@school.test",
    password: "$2a$10$1tkUqW4QzxrttuLncmGMk.VpL2pkkWP0uEo7dA7icSa.tej.D6Btq",
    role: "teacher",
    studentId: null,
    teacherId: 1,
    createdAt: "2025-09-01T07:05:00.000Z",
  },
  {
    id: 3,
    name: "Amina Yusuf",
    email: "student@school.test",
    password: "$2a$10$RnY0EyFYO9coWPYuTGhYZ.nZ29H1mpT09o.dwI1KIBZ0S/HR0m0qW",
    role: "student",
    studentId: 1,
    teacherId: null,
    createdAt: "2025-09-01T07:10:00.000Z",
  },
]);

const findByEmail = (email) => users.findOne((user) => user.email === String(email).toLowerCase());

const findById = (id) => users.findById(id);

const createUser = (data) => users.create(data);

/** Never leak the password hash outside of the auth flow. */
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  studentId: user.studentId,
  teacherId: user.teacherId,
  createdAt: user.createdAt,
});

module.exports = { users, findByEmail, findById, createUser, toPublicUser };
