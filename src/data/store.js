/**
 * Tiny in-memory collection used to simulate a database table.
 * Records are plain objects with auto-increment numeric ids.
 */
function createCollection(seed = []) {
  const rows = [...seed];
  let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

  const findById = (id) => rows.find((row) => row.id === Number(id)) || null;

  return {
    all: () => rows,

    findById,

    findOne: (predicate) => rows.find(predicate) || null,

    filter: (predicate) => rows.filter(predicate),

    create(data) {
      const record = { ...data, id: nextId, createdAt: new Date().toISOString() };
      nextId += 1;
      rows.push(record);
      return record;
    },

    update(id, data) {
      const record = findById(id);
      if (!record) return null;
      Object.assign(record, data);
      return record;
    },

    remove(id) {
      const index = rows.findIndex((row) => row.id === Number(id));
      if (index === -1) return null;
      return rows.splice(index, 1)[0];
    },
  };
}

module.exports = { createCollection };
