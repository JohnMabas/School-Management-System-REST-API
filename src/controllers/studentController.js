const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const { paginate, matchesSearch } = require("../utils/paginate");
const { students } = require("../data/students");
const { results } = require("../data/results");
const { users } = require("../data/users");

exports.create = asyncHandler(async (req, res) => {
  const student = students.create({ ...req.validatedBody, userId: null });
  created(res, "Student created successfully.", student);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, search, classId } = req.validatedQuery;

  const filtered = students.filter(
    (student) =>
      matchesSearch(student, search, ["name", "email"]) &&
      (classId === undefined || student.classId === classId)
  );

  const { items, meta } = paginate(filtered, { page, limit });
  ok(res, "Students retrieved successfully.", items, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const student = findVisibleStudent(req);
  ok(res, "Student retrieved successfully.", student);
});

exports.update = asyncHandler(async (req, res) => {
  const student = findStudent(req);
  const updated = students.update(student.id, req.validatedBody);

  if (updated.userId) {
    const user = users.findById(updated.userId);
    if (user) users.update(user.id, { name: updated.name, email: updated.email });
  }

  ok(res, "Student updated successfully.", updated);
});

/** Removing a student also removes their results and login account. */
exports.remove = asyncHandler(async (req, res) => {
  const student = findStudent(req);

  for (const result of results.filter((row) => row.studentId === student.id)) {
    results.remove(result.id);
  }

  if (student.userId) users.remove(student.userId);
  students.remove(student.id);

  ok(res, "Student deleted successfully.", { id: student.id });
});

function findStudent(req) {
  const student = students.findById(req.validatedParams.id);
  if (!student) throw new AppError("Student not found", 404);
  return student;
}

/** Students may only ever read their own record. */
function findVisibleStudent(req) {
  const student = findStudent(req);

  if (req.user.role === "student" && req.user.studentId !== student.id) {
    throw new AppError("Forbidden. You can only view your own profile.", 403);
  }

  return student;
}
