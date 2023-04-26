/**
 * Calculate the delay time based on duration given
 * @param {string} date
 * @param {number} duration
 * @returns - delay in milliseconds
 */
module.exports = (date, duration) => {
  const targetTime = new Date(date);
  let delay = 0;
  if (duration === 10) {
    delay = Number(targetTime) - 600000 - Number(new Date());
  } else if (duration === 1) {
    delay = Number(targetTime) - 1000 - Number(new Date());
  }
  return delay;
};
