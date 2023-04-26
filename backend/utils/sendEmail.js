const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { NotificationClient } = require('./notification');
const calculateDelay = require('../utils/calculateDelay');

/**
 * Construct the email template and Enqueue jobs to the queue,
 * @param {string} subject
 * @param {string} template
 * @param {string} data
 * @param {number} dur
 */
module.exports = async (subject, template, data, dur) => {
  const notification = new NotificationClient({
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  });

  // construct email template
  let payload;
  if (template === 'reset') {
    payload = {
      firstName: data.firstName,
      link: data.resetLink,
    };
  } else {
    payload = {
      firstName: data.firstName,
      provider: data.provider,
      date: data.date,
      time:
        Number(data.time.split(':')[0]) < 12
          ? data.time + 'am'
          : data.time + 'pm',
    };
  }

  const source = fs.readFileSync(
    path.join(__dirname, '../utils/template/' + template + '.handlebars'),
    'utf8'
  );
  const compiledTemplate = handlebars.compile(source);

  // enqueue job
  const job = {
    from: 'Vhealth <support@belovetech.tech>',
    subject,
    to: data.email,
    html: compiledTemplate(payload),
  };

  const delay = calculateDelay(data?.date, data?.time, dur);
  const newJob = await notification.enqueue('email-message', job, delay);

  console.info(`NEW JOB: ${newJob.data} ${newJob.id}`);

  console.info(`Enqueued an email sending to ${job.to}`);
  notification.close();
};
