import client from "prom-client";

// 🏷️ Create a registry to hold our metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // ✅ Auto-collects CPU, memory, event loop metrics

// 🟢 Track total jobs processed
const jobsProcessed = new client.Counter({
  name: "bullmq_jobs_processed_total",
  help: "Total number of jobs processed",
  labelNames: ["queue", "status"],
});

// 🟢 Track job execution time
const jobExecutionTime = new client.Histogram({
  name: "bullmq_job_execution_time_seconds",
  help: "Histogram of job execution time in seconds",
  labelNames: ["queue"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30], // Buckets for measuring job durations
});

// 🟢 Register metrics
register.registerMetric(jobsProcessed);
register.registerMetric(jobExecutionTime);

// 🟢 Expose the `/metrics` endpoint
export { register, jobsProcessed, jobExecutionTime };
