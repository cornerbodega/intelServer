import { Worker } from "bullmq";
import Redis from "ioredis";
import { taskExecutor } from "./taskExecutor.js";
import firebase from "./firebase.js"; // Ensure correct Firebase instance is used
import { ref, set } from "firebase/database";

const db = firebase.db; // ✅ Use the same Firebase DB instance as in firebaseListener.js

// Connect to Redis (Upstash or any other Redis provider)
const redisConnection = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

// Create a BullMQ worker for the "taskQueue"
const worker = new Worker(
  "taskQueue",
  async (job) => {
    console.log(`Processing task: ${job.id} (type: ${job.name})`);

    // ✅ Firebase reference for the task status
    const taskStatusRef = ref(
      db,
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.SERVER_UID
      }/${job.data.userId}/${job.name}/status`
    );

    try {
      // ✅ Update Firebase: Mark task as "in-progress"
      await set(taskStatusRef, "in-progress");
      console.log(`Task ${job.id} marked as in-progress in Firebase`);

      // ✅ Execute the actual task
      const updatedContext = await taskExecutor({
        taskName: job.name,
        taskData: job.data,
        taskContext: {}, // Or pass an initial context if needed
        userId: job.data.userId,
        taskType: job.name,
      });

      // ✅ Save task result to Firebase
      const taskResultRef = ref(
        db,
        `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
          process.env.SERVER_UID
        }/${job.data.userId}/${job.name}/result`
      );
      await set(taskResultRef, updatedContext);

      // ✅ Update Firebase: Mark task as "complete"
      await set(taskStatusRef, "complete");
      console.log(`Task ${job.id} marked as complete in Firebase`);
    } catch (error) {
      console.error(`Error processing task ${job.id}:`, error);

      // ❌ Update Firebase: Mark task as "error"
      await set(taskStatusRef, "error");

      // ❌ Log the error message in Firebase
      const taskErrorMessageRef = ref(
        db,
        `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
          process.env.SERVER_UID
        }/${job.data.userId}/${job.name}/errorMessage`
      );
      await set(taskErrorMessageRef, error.message || "Unknown error");

      throw error; // Let BullMQ handle retries and failure events
    }
  },
  { connection: redisConnection }
);

// Handle failed jobs
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
