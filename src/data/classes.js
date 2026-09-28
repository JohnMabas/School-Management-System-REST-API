const { createCollection } = require("./store");

const classes = createCollection([
  { id: 1, name: "Grade 10 - Science", level: 10, createdAt: "2025-09-01T08:00:00.000Z" },
  { id: 2, name: "Grade 11 - Arts", level: 11, createdAt: "2025-09-01T08:01:00.000Z" },
  { id: 3, name: "Grade 12 - Science", level: 12, createdAt: "2025-09-01T08:02:00.000Z" },
]);

module.exports = { classes };
