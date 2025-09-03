// src/services/utils.js

/**
 * Checks if an error is temporary and can be retried.
 * @param {Error} error The error object.
 * @returns {boolean}
 */
export function isRetryableError(error) {
  // Check for "503 Service Unavailable" in the error message
  return error.message.includes("503");
}