console.log("INTELLIGENCE SERVER STARTED");
import express from "express";
import setupFirebaseListener from "./utils/firebaseListener.js";

const app = express();

import bodyParser from "body-parser";

app.use(bodyParser.json());

app.use("/assets", express.static("assets"));

// ///////////////////////////////////////////////////////
// // Billing Webhooks
// ///////////////////////////////////////////////////////
// import stripeWebhookListener from "./api/billing/stripe-webhook-listener.js";
// app.use("/api/billing/stripe-webhook-listener", stripeWebhookListener);

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
  setupFirebaseListener();
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
