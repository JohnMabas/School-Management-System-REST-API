const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const { paginate, matchesSearch } = require("../utils/paginate");
const { teachers } = require("../data/teachers");
const { users } = require("../data/users");

function findTeacher(req) {
  const teacher = teachers.findById(req.validatedParams.id);
  if (!teacher) throw new AppError("Teacher not found", 404);
  return teacher;
}

exports.create = asyncHandler(async (req, res) => {
  const teacher = teachers.create({ ...req.validatedBody, userId: null });
  created(res, "Teacher created successfully.", teacher);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, search, subjectId } = req.validatedQuery;

  const filtered = teachers.filter(
    (teacher) =>
      matchesSearch(teacher, search, ["name", "email"]) &&
      (subjectId === undefined || teacher.subjectId === subjectId)
  );

  const { items, meta } = paginate(filtered, { page, limit });
  ok(res, "Teachers retrieved successfully.", items, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  ok(res, "Teacher retrieved successfully.", findTeacher(req));
});

exports.update = asyncHandler(async (req, res) => {
  const teacher = findTeacher(req);
  const updated = teachers.update(teacher.id, req.validatedBody);

  if (updated.userId) {
    const user = users.findById(updated.userId);
    if (user) users.update(user.id, { name: updated.name, email: updated.email });
  }

  ok(res, "Teacher updated successfully.", updated);
});

/** Removing a teacher also removes their login account. */
exports.remove = asyncHandler(async (req, res) => {
  const teacher = findTeacher(req);

  if (teacher.userId) users.remove(teacher.userId);
  teachers.remove(teacher.id);

  ok(res, "Teacher deleted successfully.", { id: teacher.id });
});
