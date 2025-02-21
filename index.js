console.log("INTELLIGENCE SERVER STARTED");
import express from "express";
import setupFirebaseListener from "./utils/firebaseListener.js";
import bodyParser from "body-parser";
// import { register } from "./utils/metrics.js"; // ✅ Import Prometheus metrics

const app = express();

app.use(bodyParser.json());

app.use("/assets", express.static("assets"));

// ///////////////////////////////////////////////////////
// // Billing Webhooks
// ///////////////////////////////////////////////////////
import stripeWebhookListener from "./api/billing/stripe-webhook-listener.js";
app.use("/api/billing/stripe-webhook-listener", stripeWebhookListener);

// import subscriptionPayment from "./api/billing/subscription-payment.js";
// app.use("/api/billing/subscription-payment", subscriptionPayment);

// ///////////////////////////////////////////////////////
// // Save Firebase Task
// ///////////////////////////////////////////////////////
import saveTask from "./api/tasks/save-task.js";
app.use("/api/tasks/save-task", saveTask);

// ///////////////////////////////////////////////////////
// Edit Report
// ///////////////////////////////////////////////////////
import editReport from "./api/reports/edit-report/edit-report.js";
app.use("/api/reports/edit-report", editReport);

// ///////////////////////////////////////////////////////
// // System Metrics for Prometheus
// ///////////////////////////////////////////////////////
// app.get("/metrics", async (req, res) => {
//   try {
//     res.set("Content-Type", register.contentType);
//     res.end(await register.metrics());
//   } catch (error) {
//     console.error("Error exposing Prometheus metrics:", error);
//     res.status(500).send("Failed to retrieve metrics");
//   }
// });

///////////////////////////////////////////////////////
// Root
///////////////////////////////////////////////////////
app.get("/", async (req, res) => {
  try {
    console.log("Marvin Intelligence Agency server received a request.");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
  setupFirebaseListener();
});

// Start the background worker
// import "./utils/worker.js";
