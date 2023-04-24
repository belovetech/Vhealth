const { Queue } = require('bullmq');

class NotificationClient {
  constructor(opts) {
    this.queue = new Queue('notification', opts);
  }

  async enqueue(jobName, job, delay = undefined) {
    await this.queue.add(jobName, job, { delay });
  }

  close() {
    return this.queue.close();
  }
}

module.exports = { NotificationClient };
