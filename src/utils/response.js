/** Single place that shapes every successful response body. */
const ok = (res, message, data, meta) =>
  res.status(200).json({ success: true, message, data, ...(meta ? { meta } : {}) });

const created = (res, message, data) => res.status(201).json({ success: true, message, data });

module.exports = { ok, created };
