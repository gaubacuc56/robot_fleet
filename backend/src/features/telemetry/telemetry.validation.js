const { NUMERIC_FIELDS } = require('./telemetry.constant.js');

/**
 * Inbound frame validation. (Q1-R2, Q1-R3)
 *
 * robotId is not in the payload — the simulator omits it. It arrives once in
 * the upgrade query string and is passed in separately by the caller.
 * See docs/assumption/01-current-state-and-gaps.md, contradiction 1.
 */

/** @returns {{ok: true, value: object} | {ok: false, errors: string[]}} */
function parseMessage(raw) {
  let text;
  try {
    text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
  } catch (error) {
    return { ok: false, errors: [`unreadable frame: ${error.message}`] };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { ok: false, errors: [`invalid JSON: ${error.message}`] };
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errors: ['payload must be a JSON object'] };
  }

  return { ok: true, value: parsed };
}

/**
 * @param {object} payload  parsed message body, without robotId
 * @param {string} robotId  taken from the socket, not the payload
 * @returns {{ok: true, value: object} | {ok: false, errors: string[]}}
 */
function validateTelemetry(payload, robotId) {
  const errors = [];

  if (typeof robotId !== 'string' || robotId.trim() === '') {
    errors.push('robotId is required and must be a non-empty string');
  }

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['payload must be a JSON object'] };
  }

  for (const field of NUMERIC_FIELDS) {
    const value = payload[field.name];

    if (value === undefined || value === null) {
      errors.push(`${field.name} is required`);
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push(`${field.name} must be a finite number`);
      continue;
    }
    if (value < field.min || value > field.max) {
      errors.push(`${field.name}=${value} is outside ${field.min}..${field.max}`);
    }
  }

  if (typeof payload.isCharging !== 'boolean') {
    errors.push('isCharging is required and must be a boolean');
  }

  let timestamp;
  if (typeof payload.timestamp !== 'string' || payload.timestamp === '') {
    errors.push('timestamp is required and must be an ISO 8601 string');
  } else {
    const parsedDate = new Date(payload.timestamp);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push(`timestamp="${payload.timestamp}" is not a valid date`);
    } else {
      timestamp = parsedDate;
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      robotId,
      batteryPercentage: payload.batteryPercentage,
      wifiSignalStrength: payload.wifiSignalStrength,
      isCharging: payload.isCharging,
      temperature: payload.temperature,
      memoryUsage: payload.memoryUsage,
      timestamp,
    },
  };
}

function parseAndValidate(raw, robotId) {
  const parsed = parseMessage(raw);
  if (!parsed.ok) return parsed;
  return validateTelemetry(parsed.value, robotId);
}

module.exports = { parseMessage, validateTelemetry, parseAndValidate };
