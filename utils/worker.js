import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { taskExecutor } from "./taskExecutor.js";
import firebase from "./firebase.js";
import signServerIntoFirebase from "./signServerIntoFirebase.js"; // Import authentication
import { ref, set } from "firebase/database";

const db = firebase.db;

// Initialize Redis connection
const redisConnection = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

// Authenticate Firebase before starting the worker
async function initializeWorker() {
  try {
    await signServerIntoFirebase();
    console.log("✅ Server signed into Firebase successfully!");
  } catch (error) {
    console.error("❌ Firebase Authentication Failed:", error);
    process.exit(1); // Exit if authentication fails
  }

  // Create a BullMQ worker for "taskQueue"
  const worker = new Worker(
    "taskQueue",
    async (job) => {
      console.log(`🔄 Processing task: ${job.id} (type: ${job.name})`);

      const taskPath = `/${"asyncTasks"}/${process.env.SERVER_UID}/${
        job.data.userId
      }/${job.name}`;

      const taskStatusRef = ref(db, `${taskPath}/status`);

      try {
        // Mark task as in-progress
        await set(taskStatusRef, "in-progress");
        console.log(`🟡 Task ${job.id} marked as "in-progress" in Firebase`);

        // Execute task
        const updatedContext = await taskExecutor({
          taskName: job.name,
          taskData: job.data,
          taskContext: {},
          userId: job.data.userId,
          taskType: job.name,
        });

        // Store task result in Firebase
        await set(ref(db, `${taskPath}/context`), updatedContext);

        // Mark task as complete
        await set(taskStatusRef, "complete");
        console.log(`✅ Task ${job.id} marked as "complete" in Firebase`);
      } catch (error) {
        console.error(`❌ Error processing task ${job.id}:`, error);

        // Mark task as failed in Firebase
        await set(taskStatusRef, "error");

        // Log error message in Firebase
        await set(
          ref(db, `${taskPath}/errorMessage`),
          error.message || "Unknown error"
        );

        throw error; // Let BullMQ handle retries
      }
    },
    { connection: redisConnection }
  );

  // Log worker events for debugging
  worker.on("ready", () =>
    console.log("🚀 Worker is ready and listening for tasks")
  );
  worker.on("error", (err) =>
    console.error("❌ Worker encountered an error:", err)
  );
  worker.on("failed", (job, err) =>
    console.error(`❌ Job ${job?.id} failed:`, err)
  );
  worker.on("completed", (job) =>
    console.log(`✅ Job ${job.id} completed successfully`)
  );

  console.log("👷 Worker initialized and awaiting jobs...");
}

initializeWorker(); // Call function to sign in and start worker

console.log("👷 Worker initialized and awaiting jobs...");

const queue = new Queue("taskQueue", { connection: redisConnection });
async function checkQueue() {
  const waitingJobs = await queue.getWaiting();
  const activeJobs = await queue.getActive();
  const delayedJobs = await queue.getDelayed();
  const failedJobs = await queue.getFailed();

  console.log(`📊 Jobs in Queue:`);
  console.log(`🔹 Waiting: ${waitingJobs.length}`);
  console.log(`🔹 Active: ${activeJobs.length}`);
  console.log(`🔹 Delayed: ${delayedJobs.length}`);
  console.log(`🔹 Failed: ${failedJobs.length}`);

  if (waitingJobs.length > 0) {
    console.log("➡️ First Waiting Job Details:", waitingJobs[0]);
  }
}

checkQueue();

async function getFailedJobs() {
  const failedJobs = await queue.getFailed();

  console.log(`❌ Failed Jobs Count: ${failedJobs.length}`);

  if (failedJobs.length > 0) {
    console.log(
      "🔴 First Failed Job Details:",
      JSON.stringify(failedJobs[0], null, 2)
    );
  }
}

getFailedJobs();
