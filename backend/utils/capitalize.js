/**
 * capitalize query string
 * @param {string} value
 * @returns capitalized string
 */
module.exports = (value) => {
  return value[0].toUpperCase() + value.slice(1).toLowerCase();
};
