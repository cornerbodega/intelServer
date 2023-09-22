console.log("INTELLIGENCE SERVER STARTED");
import express from "express";

const app = express();
import { fetch } from "undici";
// console.log("fetch");
// console.log(fetch);
import axios from "axios";

const port = 3000;
app.use(express.json());
import { createClient } from "@supabase/supabase-js";
// const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://zibmgusmsqnpqacuygec.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYm1ndXNtc3FucHFhY3V5Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA4NDkzOTUsImV4cCI6MjAwNjQyNTM5NX0.DPSFsM5RekVICcIeV9PK08uwOEntnWuCVBWt-DBmxkA"
);

// const tasksChannel = supabase.channel("asyncTasks");
// tasksChannel
//   .on("broadcast", { event: "INSERT" }, (payload) => console.log(payload))
//   .subscribe();

// supabase
//   .channel("any")
//   .on(
//     "postgres_changes",
//     { event: "INSERT", schema: "public", table: "asyncTasks" },
//     (payload) => {
//       console.log("Change received!", payload);
//     }
//   )
//   .subscribe();
// console.log("supabase");
// // console.log(supabase);
// // listen for updates to the asyncTasks table
// // and run the task when it's ready
// console.log(supabase.from("asyncTasks:INSERT"));
// // .on("INSERT", (payload) => {
//   console.log("New task added:", payload.new);
//   // Here you would add the logic to handle new tasks, like adding them to your worker's processing queue
// })
// .subscribe();
// supabase
//   .from("asyncTasks")
//   .on("INSERT", (payload) => {
//     console.log("New task:", payload.new);
//     // Trigger necessary actions (like processing the task)
//   })
//   .on("UPDATE", (payload) => {
//     console.log("Task updated:", payload.new);
//     // Trigger necessary actions (like updating task status)
//   })
//   .subscribe();

// app.use("/agents/create", async (req, res) => {
//   // create the agent
//   // return the 200 so the client can continue
// });

// Serve the files in /assets at the URI /assets.
app.use("/assets", express.static("assets"));
// const generateAgentName = require("./routes/generate-agent-name");
import generateAgentName from "./api/agents/generate-agent-name.js";
app.get("/", async (req, res) => {
  try {
    console.log("Hello");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.use("/api/agents/generate-agent-name", generateAgentName);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
