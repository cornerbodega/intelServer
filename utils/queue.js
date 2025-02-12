// utils/queue.js
import { Queue } from "bullmq";
import Redis from "ioredis";

// Connect to Redis using the REDIS_URL environment variable
const redisConnection = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

// Create (or get) the BullMQ queue named "taskQueue"
const taskQueue = new Queue("taskQueue", { connection: redisConnection });

/**
 * Adds a task to the Redis queue.
 * Uses a computed jobId for idempotency (to avoid duplicate tasks).
 *
 * @param {string} taskName - The name/type of the task.
 * @param {object} taskData - The task payload (should include at least userId).
 */
export async function addTaskToQueue(taskName, taskData) {
  const jobId = `${taskData.userId}:${taskName}:${JSON.stringify(taskData)}`;
  await taskQueue.add(taskName, taskData, { jobId, removeOnComplete: true });
  console.log(`Task queued with jobId: ${jobId}`);
}
