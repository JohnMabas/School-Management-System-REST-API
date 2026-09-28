const { parse, idParam, paginated } = require("./schema");
const { subjects } = require("../data/subjects");

const subjectSchema = {
  name: {
    type: "string",
    required: true,
    min: 2,
    max: 80,
    unique: { collection: () => subjects, message: "A subject with this name already exists." },
  },
  code: {
    type: "string",
    required: true,
    min: 2,
    max: 10,
    label: "code",
    uppercase: true,
    unique: { collection: () => subjects, message: "A subject with this code already exists." },
  },
  description: { type: "string", max: 255 },
};

exports.create = (body) => parse(body, subjectSchema);
exports.update = (body, req) => parse(body, subjectSchema, { partial: true, exceptId: req.params.id });
exports.idParam = idParam;
exports.listQuery = (query) => paginated(query);
