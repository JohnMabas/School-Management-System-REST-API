const { createCollection } = require("./store");

const teachers = createCollection([
  {
    id: 1,
    userId: 2,
    name: "Bello Adamu",
    email: "teacher@school.test",
    phone: "+2348020000001",
    subjectId: 1,
    createdAt: "2025-09-02T09:10:00.000Z",
  },
  {
    id: 2,
    userId: null,
    name: "Grace Nwosu",
    email: "grace.nwosu@school.test",
    phone: "+2348020000002",
    subjectId: 2,
    createdAt: "2025-09-02T09:11:00.000Z",
  },
]);

const findByUserId = (userId) => teachers.findOne((teacher) => teacher.userId === Number(userId)) || null;

module.exports = { teachers, findByUserId };
