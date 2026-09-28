const { createCollection } = require("./store");

const results = createCollection([
  {
    id: 1,
    studentId: 1,
    subjectId: 1,
    score: 88,
    grade: "B",
    term: 1,
    session: "2025/2026",
    createdAt: "2025-10-05T10:00:00.000Z",
  },
  {
    id: 2,
    studentId: 1,
    subjectId: 2,
    score: 74,
    grade: "C",
    term: 1,
    session: "2025/2026",
    createdAt: "2025-10-05T10:01:00.000Z",
  },
  {
    id: 3,
    studentId: 2,
    subjectId: 1,
    score: 95,
    grade: "A",
    term: 1,
    session: "2025/2026",
    createdAt: "2025-10-05T10:02:00.000Z",
  },
  {
    id: 4,
    studentId: 3,
    subjectId: 4,
    score: 61,
    grade: "D",
    term: 2,
    session: "2025/2026",
    createdAt: "2026-01-12T10:00:00.000Z",
  },
]);

const hasResultFor = ({ studentId, subjectId, term, session, exceptId }) =>
  results.findOne(
    (result) =>
      result.id !== Number(exceptId) &&
      result.studentId === Number(studentId) &&
      result.subjectId === Number(subjectId) &&
      result.term === Number(term) &&
      result.session === session
  ) || null;

module.exports = { results, hasResultFor };
