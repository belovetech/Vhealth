/**
 * appointment Notification
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '/../.config.env') });

const notification = new NotificationClient({
  connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

const emailJob = async (job) => {
  try {
    console.log(job.data);
    const messageData = job.data;
    const res = await client.messages.create(DOMAIN, messageData);
    return res;
  } catch (error) {
    console.log(`ERROR: ${error}`);
    return error;
  }
};

const appointmentNotification = async (queueJob) => {
  console.log(queueJob);
  const job = emailJob(queueJob);
  await notification.enqueue('immediate', job);
  // console.info(`Enqueued an email sending to ${job.to}`);
};

const tenMinsBeforeAppointement = async (queueJob) => {
  const dateAndTime = queueJob.date + ' ' + queueJob.time;
  const targetTime = new Date(dateAndTime);
  const tenMins = 10 * 60 * 1000;
  const delay = Number(targetTime) - Number(new Date()) - tenMins;

  const job = emailJob(queueJob);
  await notification.enqueue('email-message', job, { delay });
  // console.info(`Enqueued an email sending to ${job.to}`);
};

const appointementTime = async (queueJob) => {
  const dateAndTime = queueJob.date + ' ' + queueJob.time;
  const targetTime = new Date(dateAndTime);
  const delay = Number(targetTime) - Number(new Date()) - 1000;

  const job = emailJob(queueJob);
  await notification.enqueue('email-message', job, { delay });
  // console.info(`Enqueued an email sending to ${job.to}`);
};

module.exports = {
  appointmentNotification,
  tenMinsBeforeAppointement,
  appointementTime,
};
