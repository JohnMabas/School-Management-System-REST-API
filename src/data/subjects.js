const { createCollection } = require("./store");

const subjects = createCollection([
  { id: 1, name: "Mathematics", code: "MATH", description: "Numbers, quantity, space and change.", createdAt: "2025-09-01T08:10:00.000Z" },
  { id: 2, name: "English", code: "ENG", description: "Reading, writing and comprehension.", createdAt: "2025-09-01T08:11:00.000Z" },
  { id: 3, name: "Physics", code: "PHY", description: "Matter, motion and energy.", createdAt: "2025-09-01T08:12:00.000Z" },
  { id: 4, name: "Biology", code: "BIO", description: "Living organisms and life processes.", createdAt: "2025-09-01T08:13:00.000Z" },
  { id: 5, name: "Computer Science", code: "CSC", description: "Computation, algorithms and systems.", createdAt: "2025-09-01T08:14:00.000Z" },
]);

module.exports = { subjects };
