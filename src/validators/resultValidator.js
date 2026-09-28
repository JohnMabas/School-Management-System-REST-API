const { parse, idParam, paginated } = require("./schema");
const { students } = require("../data/students");
const { subjects } = require("../data/subjects");

const TERMS = { type: "enum", values: ["1", "2", "3"], numeric: true, label: "term" };

const resultSchema = {
  studentId: { type: "ref", collection: () => students, entity: "student", required: true },
  subjectId: { type: "ref", collection: () => subjects, entity: "subject", required: true },
  score: { type: "number", min: 0, max: 100, required: true },
  term: { ...TERMS, required: true },
  session: { type: "session", required: true },
};

exports.create = (body) => parse(body, resultSchema);
exports.update = (body, req) => parse(body, resultSchema, { partial: true, exceptId: req.params.id });
exports.idParam = idParam;
exports.listQuery = (query) =>
  paginated(query, {
    studentId: { type: "ref", collection: () => students, entity: "student", label: "studentId" },
    subjectId: { type: "ref", collection: () => subjects, entity: "subject", label: "subjectId" },
    term: TERMS,
    session: { type: "session" },
  });
