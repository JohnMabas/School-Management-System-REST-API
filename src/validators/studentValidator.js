const { parse, idParam, paginated } = require("./schema");
const { users } = require("../data/users");
const { classes } = require("../data/classes");

const studentSchema = {
  name: { type: "string", required: true, min: 2, max: 80 },
  email: {
    type: "email",
    required: true,
    unique: { collection: () => users, message: "email is already in use by another account." },
  },
  phone: { type: "phone" },
  classId: { type: "ref", collection: () => classes, entity: "class", label: "classId" },
};

exports.create = (body) => parse(body, studentSchema);
exports.update = (body, req) => parse(body, studentSchema, { partial: true, exceptId: req.params.id });
exports.idParam = idParam;
exports.listQuery = (query) =>
  paginated(query, {
    classId: { type: "ref", collection: () => classes, entity: "class", label: "classId" },
  });
