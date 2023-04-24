const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { NotificationClient } = require('./notification');
const calculateDelay = require('../utils/calculateDelay');

module.exports = async (subject, template, data, dur) => {
  const notification = new NotificationClient({
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  });

  const payload = {
    firstName: data.firstName,
    provider: data.provider,
    date: data.date,
    time:
      Number(data.time.split(':')[0]) < 12
        ? data.time + 'am'
        : data.time + 'pm',
  };

  const source = fs.readFileSync(
    path.join(__dirname, '../utils/template/' + template + '.handlebars'),
    'utf8'
  );
  const compiledTemplate = handlebars.compile(source);

  const job = {
    from: 'Vhealth <support@belovetech.tech>',
    subject,
    to: data.email,
    html: compiledTemplate(payload),
  };

  const delay = calculateDelay(`${data.date} ${data.time}`, dur);
  await notification.enqueue('email-message', job, delay);

  console.info(`Enqueued an email sending to ${job.to}`);
  notification.close();
};
