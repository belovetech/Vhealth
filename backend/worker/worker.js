const dotenv = require('dotenv');
const { Worker } = require('bullmq');
const {
  appointmentNotification,
  tenMinsBeforeAppointement,
  appointementTime,
} = require('./emailProcessor');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '/../.config.env') });

const worker = new Worker(
  'email-notification',
  async (job) => {
    console.log(job.name);
    switch (job.name) {
      case 'immediate': {
        await appointmentNotification(job);
        break;
      }
      case '10mins': {
        await tenMinsBeforeAppointement(job);
        break;
      }
      case 'exactTime': {
        await appointementTime(job);
        break;
      }
    }
  },
  {
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
    concurrency: parseInt(process.env.CONCURRENCY, 10),
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 0 },
  }
);
console.info('Worker listening for mail jobs');

module.exports = worker;
