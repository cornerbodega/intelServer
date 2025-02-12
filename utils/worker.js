import { Worker } from "bullmq";
import Redis from "ioredis";
import { taskExecutor } from "./taskExecutor.js";
import firebase from "./firebase.js";
import { ref, set } from "firebase/database";
import { jobsProcessed, jobExecutionTime } from "./metrics.js"; // Import Prometheus metrics

const db = firebase.db;
const redisConnection = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

// Create BullMQ worker
const worker = new Worker(
  "taskQueue",
  async (job) => {
    console.log(`Processing task: ${job.id} (type: ${job.name})`);
    const startTime = Date.now(); // ✅ Start timing job execution

    const taskStatusRef = ref(
      db,
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.SERVER_UID
      }/${job.data.userId}/${job.name}/status`
    );

    try {
      await set(taskStatusRef, "in-progress");
      console.log(`Task ${job.id} marked as in-progress`);

      // ✅ Execute task
      const updatedContext = await taskExecutor({
        taskName: job.name,
        taskData: job.data,
        taskContext: {},
        userId: job.data.userId,
        taskType: job.name,
      });

      const taskResultRef = ref(
        db,
        `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
          process.env.SERVER_UID
        }/${job.data.userId}/${job.name}/result`
      );
      await set(taskResultRef, updatedContext);

      await set(taskStatusRef, "complete");
      console.log(`Task ${job.id} completed`);

      // ✅ Update Prometheus Metrics
      jobsProcessed.inc({ queue: "taskQueue", status: "completed" });
      jobExecutionTime.observe(
        { queue: "taskQueue" },
        (Date.now() - startTime) / 1000
      );
    } catch (error) {
      console.error(`Task ${job.id} failed:`, error);
      await set(taskStatusRef, "error");

      const taskErrorRef = ref(
        db,
        `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
          process.env.SERVER_UID
        }/${job.data.userId}/${job.name}/errorMessage`
      );
      await set(taskErrorRef, error.message || "Unknown error");

      // ❌ Update Prometheus Metrics for failures
      jobsProcessed.inc({ queue: "taskQueue", status: "failed" });
      throw error;
    }
  },
  { connection: redisConnection }
);

// Log failed jobs
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
