/**
 * Consistent API response helpers.
 * Every controller uses these instead of raw res.json()
 * so the response shape is always identical.
 *
 * Success shape:  { success: true,  data: <payload> }
 * Error shape:    { success: false, message: <string>, ...extras }
 */

const sendSuccess = (res, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const sendError = (res, message = 'Something went wrong', statusCode = 500, extras = {}) =>
  res.status(statusCode).json({ success: false, message, ...extras });

module.exports = { sendSuccess, sendError };
