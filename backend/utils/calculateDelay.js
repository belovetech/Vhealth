module.exports = (date, duration) => {
  const targetTime = new Date(date);
  let delay = 0;
  if (duration === 10) {
    delay = Number(targetTime) - (Number(new Date()) - 600000);
  } else if (duration === 1) {
    delay = Number(targetTime) - (Number(new Date()) - 1000);
  }
  return delay;
};
