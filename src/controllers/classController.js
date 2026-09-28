const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const { paginate, matchesSearch } = require("../utils/paginate");
const { classes } = require("../data/classes");
const { students } = require("../data/students");

function findClass(req) {
  const record = classes.findById(req.validatedParams.id);
  if (!record) throw new AppError("Class not found", 404);
  return record;
}

exports.create = asyncHandler(async (req, res) => {
  const record = classes.create(req.validatedBody);
  created(res, "Class created successfully.", record);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.validatedQuery;

  const filtered = classes.filter((record) => matchesSearch(record, search, ["name"]));
  const { items, meta } = paginate(filtered, { page, limit });

  ok(res, "Classes retrieved successfully.", items, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  ok(res, "Class retrieved successfully.", findClass(req));
});

exports.update = asyncHandler(async (req, res) => {
  const record = findClass(req);
  ok(res, "Class updated successfully.", classes.update(record.id, req.validatedBody));
});

/** A class that still has students cannot be removed. */
exports.remove = asyncHandler(async (req, res) => {
  const record = findClass(req);
  const enrolled = students.filter((student) => student.classId === record.id);

  if (enrolled.length) {
    throw new AppError(
      `Class cannot be deleted while it still has ${enrolled.length} student(s). Reassign them first.`,
      409
    );
  }

  classes.remove(record.id);
  ok(res, "Class deleted successfully.", { id: record.id });
});
