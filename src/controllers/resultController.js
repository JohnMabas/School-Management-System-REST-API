const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");
const { paginate } = require("../utils/paginate");
const { gradeFromScore } = require("../utils/grade");
const { results, hasResultFor } = require("../data/results");

function findResult(req) {
  const result = results.findById(req.validatedParams.id);
  if (!result) throw new AppError("Result not found", 404);
  return result;
}

/** Students are locked to their own results, no matter which filter they pass. */
function assertOwnership(req, studentId) {
  if (req.user.role === "student" && req.user.studentId !== studentId) {
    throw new AppError("Forbidden. You can only view your own results.", 403);
  }
}

/** One result per student, subject, term and session. */
function assertNoDuplicate(payload, exceptId) {
  if (hasResultFor({ ...payload, exceptId })) {
    throw new AppError("A result for this student, subject, term and session already exists.", 409);
  }
}

exports.create = asyncHandler(async (req, res) => {
  const { studentId, subjectId, score, term, session } = req.validatedBody;

  assertNoDuplicate(req.validatedBody);
  const result = results.create({
    studentId,
    subjectId,
    score,
    grade: gradeFromScore(score),
    term,
    session,
  });

  created(res, "Result created successfully.", result);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, studentId, subjectId, term, session } = req.validatedQuery;
  const effectiveStudentId = req.user.role === "student" ? req.user.studentId : studentId;

  const filtered = results.filter(
    (row) =>
      (effectiveStudentId === undefined || row.studentId === effectiveStudentId) &&
      (subjectId === undefined || row.subjectId === subjectId) &&
      (term === undefined || row.term === term) &&
      (session === undefined || row.session === session)
  );

  const { items, meta } = paginate(filtered, { page, limit });
  ok(res, "Results retrieved successfully.", items, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = findResult(req);
  assertOwnership(req, result.studentId);
  ok(res, "Result retrieved successfully.", result);
});

exports.update = asyncHandler(async (req, res) => {
  const current = findResult(req);
  assertNoDuplicate({ ...current, ...req.validatedBody }, current.id);

  const updates = { ...req.validatedBody };
  if (updates.score !== undefined) updates.grade = gradeFromScore(updates.score);

  ok(res, "Result updated successfully.", results.update(current.id, updates));
});

exports.remove = asyncHandler(async (req, res) => {
  const result = findResult(req);
  results.remove(result.id);
  ok(res, "Result deleted successfully.", { id: result.id });
});
