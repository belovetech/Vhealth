/**
 * Background worker that processes the job in the queue
 */

const { Worker } = require('bullmq');
const SendMail = require('./emailProcessor');

const worker = new Worker(
  'notification',
  async (job) => {
    switch (job.name) {
      case 'email-message': {
        await SendMail(job);
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
