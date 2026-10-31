export function required(value, message = "This field is required.") {
  if (value == null || String(value).trim() === "") return message;
  return "";
}

export function minLength(value, length, message) {
  if (String(value ?? "").trim().length < length) {
    return message || `Must be at least ${length} characters.`;
  }
  return "";
}

export function isEmail(value, message = "Enter a valid email address.") {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(String(value ?? ""))) return message;
  return "";
}

export function isPhone(value, message = "Enter a valid 10-digit phone number.") {
  const pattern = /^[6-9]\d{9}$/;
  if (!pattern.test(String(value ?? "").trim())) return message;
  return "";
}

export function isPositiveNumber(value, message = "Must be greater than zero.") {
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return message;
  return "";
}

export function isNonNegativeNumber(value, message = "Cannot be negative.") {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return message;
  return "";
}

export function isGSTNumber(value, message = "Enter a valid 15-character GSTIN.") {
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!pattern.test(String(value ?? "").trim().toUpperCase())) return message;
  return "";
}

export function isPincode(value, message = "Enter a valid 6-digit PIN code.") {
  const pattern = /^[1-9][0-9]{5}$/;
  if (!pattern.test(String(value ?? "").trim())) return message;
  return "";
}

/**
 * Runs a set of { field: [validatorFns] } rules against a values object.
 * Each validator fn receives the field value and returns an error string or "".
 */
export function validateFields(values, rules) {
  const errors = {};
  for (const field of Object.keys(rules)) {
    for (const validator of rules[field]) {
      const error = validator(values[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
