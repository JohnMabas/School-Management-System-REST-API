const AppError = require("../utils/AppError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{6,19}$/;
const SESSION_PATTERN = /^\d{4}\/\d{4}$/;
const PASSWORD_MIN = 8;
// bcrypt silently truncates anything past 72 bytes, so the limit is enforced up front.
const PASSWORD_MAX = 72;

function ok(value) {
  return { ok: true, value };
}

function fail(message) {
  return { ok: false, message };
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function parseField(field, value, rules) {
  const name = rules.label || field;

  switch (rules.type) {
    case "string": {
      if (typeof value !== "string") return fail(`${name} must be a string.`);
      const parsed = value.trim();
      if (rules.min && parsed.length < rules.min) return fail(`${name} must be at least ${rules.min} characters.`);
      if (rules.max && parsed.length > rules.max) return fail(`${name} must be at most ${rules.max} characters.`);
      if (rules.uppercase && !/^[A-Za-z0-9-]+$/.test(parsed)) {
        return fail(`${name} may only contain letters, numbers and hyphens.`);
      }
      return ok(rules.uppercase ? parsed.toUpperCase() : parsed);
    }

    case "email": {
      if (typeof value !== "string") return fail(`${name} must be a string.`);
      const parsed = value.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(parsed)) return fail(`${name} must be a valid email address.`);
      return ok(parsed);
    }

    case "phone": {
      if (typeof value !== "string") return fail(`${name} must be a string.`);
      const parsed = value.trim();
      if (!PHONE_PATTERN.test(parsed)) return fail(`${name} must be a valid phone number.`);
      return ok(parsed);
    }

    case "password": {
      if (typeof value !== "string") return fail(`${name} must be a string.`);
      if (value.length < PASSWORD_MIN) return fail(`${name} must be at least ${PASSWORD_MIN} characters long.`);
      if (value.length > PASSWORD_MAX) return fail(`${name} must be at most ${PASSWORD_MAX} characters long.`);
      if (!/[a-z]/.test(value)) return fail(`${name} must contain at least one lowercase letter.`);
      if (!/[A-Z]/.test(value)) return fail(`${name} must contain at least one uppercase letter.`);
      if (!/\d/.test(value)) return fail(`${name} must contain at least one number.`);
      if (!/[^A-Za-z0-9]/.test(value)) return fail(`${name} must contain at least one special character.`);
      return ok(value);
    }

    case "number": {
      const parsed = toNumber(value);
      if (!Number.isFinite(parsed)) return fail(`${name} must be a number.`);
      if (rules.integer && !Number.isInteger(parsed)) return fail(`${name} must be a whole number.`);
      if (rules.min !== undefined && parsed < rules.min) return fail(`${name} must be at least ${rules.min}.`);
      if (rules.max !== undefined && parsed > rules.max) return fail(`${name} must be at most ${rules.max}.`);
      return ok(parsed);
    }

    case "enum": {
      const parsed = String(value).trim().toLowerCase();
      if (!rules.values.includes(parsed)) return fail(`${name} must be one of: ${rules.values.join(", ")}.`);
      return ok(rules.numeric ? Number(parsed) : parsed);
    }

    case "id": {
      const parsed = toNumber(value);
      if (!Number.isInteger(parsed) || parsed < 1) return fail(`${name} must be a valid positive id.`);
      return ok(parsed);
    }

    case "ref": {
      const parsed = toNumber(value);
      if (!Number.isInteger(parsed) || parsed < 1) return fail(`${name} must be a valid ${rules.entity} id.`);
      if (!rules.collection().findById(parsed)) return fail(`${name} must reference an existing ${rules.entity}.`);
      return ok(parsed);
    }

    case "session": {
      if (typeof value !== "string") return fail(`${name} must be a string.`);
      const parsed = value.trim();
      if (!SESSION_PATTERN.test(parsed)) return fail(`${name} must look like 2025/2026.`);
      return ok(parsed);
    }

    default:
      return fail(`${name} has an unsupported field type.`);
  }
}

/**
 * Validates a plain object (body, params or query) against a field schema.
 * Every failure is reported at once so clients can fix their request in one go.
 *
 * Field rules: type, required, default, label, min, max, integer, numeric,
 * values, entity, collection, unique.
 */
function parse(source, schema, { partial = false, sourceName = "body", exceptId, emptyIsMissing = false } = {}) {
  if (source === null || typeof source !== "object" || Array.isArray(source)) {
    throw new AppError(`Invalid ${sourceName}: expected a JSON object.`, 400);
  }

  const errors = [];
  const value = {};

  for (const key of Object.keys(source)) {
    if (!(key in schema)) {
      errors.push({ field: key, message: `${key} is not a recognised field.` });
    }
  }

  for (const [field, rules] of Object.entries(schema)) {
    const provided =
      source[field] !== undefined && !(emptyIsMissing && source[field] === "");

    if (!provided) {
      if (rules.default !== undefined) {
        value[field] = typeof rules.default === "function" ? rules.default() : rules.default;
      } else if (rules.required && !partial) {
        errors.push({ field, message: `${rules.label || field} is required.` });
      }
      continue;
    }

    const result = parseField(field, source[field], rules);

    if (!result.ok) {
      errors.push({ field, message: result.message });
      continue;
    }

    if (rules.unique) {
      const duplicate = rules.unique
        .collection()
        .findOne((row) => row.id !== Number(exceptId) && row[field] === result.value);
      if (duplicate) {
        errors.push({ field, message: rules.unique.message });
        continue;
      }
    }

    value[field] = result.value;
  }

  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push({ field: sourceName, message: "Provide at least one field to update." });
  }

  if (errors.length) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return value;
}

const ID_PARAM_SCHEMA = { id: { type: "id", required: true } };

const PAGINATION_SCHEMA = {
  page: { type: "number", integer: true, min: 1, default: 1 },
  limit: { type: "number", integer: true, min: 1, max: 100, default: 20 },
  search: { type: "string", max: 80 },
};

const idParam = (params) => parse(params, ID_PARAM_SCHEMA, { sourceName: "params" });

const paginated = (query, extra = {}) =>
  parse(query, { ...PAGINATION_SCHEMA, ...extra }, { sourceName: "query", emptyIsMissing: true });

module.exports = { parse, idParam, paginated, PASSWORD_MAX };
