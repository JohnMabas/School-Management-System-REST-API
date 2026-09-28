const { parse, idParam, paginated } = require("./schema");
const { classes } = require("../data/classes");

const classSchema = {
  name: {
    type: "string",
    required: true,
    min: 2,
    max: 80,
    unique: { collection: () => classes, message: "A class with this name already exists." },
  },
  level: {
    type: "number",
    integer: true,
    min: 1,
    max: 12,
    required: true,
    unique: { collection: () => classes, message: "A class with this level already exists." },
  },
};

exports.create = (body) => parse(body, classSchema);
exports.update = (body, req) => parse(body, classSchema, { partial: true, exceptId: req.params.id });
exports.idParam = idParam;
exports.listQuery = (query) => paginated(query);
