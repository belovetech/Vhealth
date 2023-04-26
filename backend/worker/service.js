/**
 * Worker Service - It notifies if job is completed or failed
 */

const worker = require('./worker');

worker.on('completed', (job) =>
  console.info(
    `Completed job ${job.id} successfully, sent email to ${job.data.to}`
  )
);
worker.on('failed', (job, err) =>
  console.info(`Failed job ${job.id} with ${err}`)
);
