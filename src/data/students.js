const { createCollection } = require("./store");

const students = createCollection([
  {
    id: 1,
    userId: 3,
    name: "Amina Yusuf",
    email: "student@school.test",
    phone: "+2348010000001",
    classId: 1,
    createdAt: "2025-09-02T09:00:00.000Z",
  },
  {
    id: 2,
    userId: null,
    name: "Chidi Obi",
    email: "chidi.obi@school.test",
    phone: "+2348010000002",
    classId: 1,
    createdAt: "2025-09-02T09:01:00.000Z",
  },
  {
    id: 3,
    userId: null,
    name: "Fatima Sani",
    email: "fatima.sani@school.test",
    phone: "+2348010000003",
    classId: 2,
    createdAt: "2025-09-02T09:02:00.000Z",
  },
  {
    id: 4,
    userId: null,
    name: "Ibrahim Musa",
    email: "ibrahim.musa@school.test",
    phone: "+2348010000004",
    classId: 3,
    createdAt: "2025-09-02T09:03:00.000Z",
  },
]);

const findByUserId = (userId) => students.findOne((student) => student.userId === Number(userId)) || null;

module.exports = { students, findByUserId };
