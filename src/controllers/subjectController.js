const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const { paginate, matchesSearch } = require("../utils/paginate");
const { subjects } = require("../data/subjects");
const { results } = require("../data/results");

function findSubject(req) {
  const record = subjects.findById(req.validatedParams.id);
  if (!record) throw new AppError("Subject not found", 404);
  return record;
}

exports.create = asyncHandler(async (req, res) => {
  const record = subjects.create(req.validatedBody);
  created(res, "Subject created successfully.", record);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.validatedQuery;

  const filtered = subjects.filter((record) => matchesSearch(record, search, ["name", "code"]));
  const { items, meta } = paginate(filtered, { page, limit });

  ok(res, "Subjects retrieved successfully.", items, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  ok(res, "Subject retrieved successfully.", findSubject(req));
});

exports.update = asyncHandler(async (req, res) => {
  const record = findSubject(req);
  ok(res, "Subject updated successfully.", subjects.update(record.id, req.validatedBody));
});

/** A subject that already has results cannot be removed. */
exports.remove = asyncHandler(async (req, res) => {
  const record = findSubject(req);
  const used = results.filter((row) => row.subjectId === record.id);

  if (used.length) {
    throw new AppError(
      `Subject cannot be deleted while it has ${used.length} result(s). Delete the results first.`,
      409
    );
  }

  subjects.remove(record.id);
  ok(res, "Subject deleted successfully.", { id: record.id });
});
