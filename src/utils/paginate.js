/** Slices an in-memory list into a page and returns the matching pagination meta. */
function paginate(rows, { page = 1, limit = 20 } = {}) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    items: rows.slice(start, start + limit),
    meta: { total, page, limit, pages },
  };
}

/** Case-insensitive "contains" filter used by the ?search= query parameter. */
const matchesSearch = (row, search, fields) => {
  if (!search) return true;
  const needle = search.toLowerCase();
  return fields.some((field) => String(row[field] ?? "").toLowerCase().includes(needle));
};

module.exports = { paginate, matchesSearch };
