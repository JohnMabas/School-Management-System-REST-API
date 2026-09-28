const { parse, idParam, paginated } = require("./schema");
const { users } = require("../data/users");
const { subjects } = require("../data/subjects");

const teacherSchema = {
  name: { type: "string", required: true, min: 2, max: 80 },
  email: {
    type: "email",
    required: true,
    unique: { collection: () => users, message: "email is already in use by another account." },
  },
  phone: { type: "phone" },
  subjectId: { type: "ref", collection: () => subjects, entity: "subject", label: "subjectId" },
};

exports.create = (body) => parse(body, teacherSchema);
exports.update = (body, req) => parse(body, teacherSchema, { partial: true, exceptId: req.params.id });
exports.idParam = idParam;
exports.listQuery = (query) =>
  paginated(query, {
    subjectId: { type: "ref", collection: () => subjects, entity: "subject", label: "subjectId" },
  });
