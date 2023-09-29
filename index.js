console.log("INTELLIGENCE SERVER STARTED");
import express from "express";
import setupFirebaseListener from "./utils/firebaseListener.js";
const app = express();
import { fetch } from "undici";

import axios from "axios";

import bodyParser from "body-parser";

// Parse JSON request bodies
app.use(bodyParser.json());

// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   "https://zibmgusmsqnpqacuygec.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYm1ndXNtc3FucHFhY3V5Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA4NDkzOTUsImV4cCI6MjAwNjQyNTM5NX0.DPSFsM5RekVICcIeV9PK08uwOEntnWuCVBWt-DBmxkA"
// );

// Serve the files in /assets at the URI /assets.
app.use("/assets", express.static("assets"));

// ///////////////////////////////////////////////////////
// // Create Agent
// ///////////////////////////////////////////////////////
// import generateAgentName from "./api/agents/add-agent/generate-agent-name.js";
// app.use("/api/agents/add-agent/generate-agent-name", generateAgentName);

// import generateExpertise from "./api/agents/add-agent/generate-expertise.js";
// app.use("/api/agents/add-agent/generate-expertise", generateExpertise);

// import generateAgentProfilePic from "./api/agents/add-agent/generate-agent-profile-pic.js";
// app.use(
//   "/api/agents/add-agent/generate-agent-profile-pic",
//   generateAgentProfilePic
// );

// import uploadAgentProfilePic from "./api/agents/add-agent/upload-agent-profile-pic.js";
// app.use(
//   "/api/agents/add-agent/upload-agent-profile-pic",
//   uploadAgentProfilePic
// );

// import saveAgentToSupabase from "./api/agents/add-agent/save-agent-to-supabase.js";
// app.use("/api/agents/add-agent/save-agent-to-supabase", saveAgentToSupabase);

// ///////////////////////////////////////////////////////
// // Write Draft Report
// ///////////////////////////////////////////////////////
// import draftReport from "./api/reports/draft-report/draft-report.js";
// app.use("/api/reports/draft-report/draft-report", draftReport);

// ///////////////////////////////////////////////////////
// // Save Report
// ///////////////////////////////////////////////////////
// import generateImagePromptForReport from "./api/reports/save-report/generate-image-prompt-for-report.js";
// app.use(
//   "/api/reports/save-report/generate-image-prompt-for-report",
//   generateImagePromptForReport
// );

// import generateReportImage from "./api/reports/save-report/generate-report-image.js";
// app.use("/api/reports/save-report/generate-report-image", generateReportImage);

// import uploadReportImageToCloudinary from "./api/reports/save-report/upload-report-image-to-cloudinary.js";
// app.use(
//   "/api/reports/save-report/upload-report-image-to-cloudinary",
//   uploadReportImageToCloudinary
// );

// import generateReportSummary from "./api/reports/save-report/generate-report-summary.js";
// app.use(
//   "/api/reports/save-report/generate-report-summary",
//   generateReportSummary
// );

// import saveReportToSupabase from "./api/reports/save-report/save-report-to-supabase.js";
// app.use(
//   "/api/reports/save-report/save-report-to-supabase",
//   saveReportToSupabase
// );

// import saveLinks from "./api/reports/save-report/save-links.js";
// app.use("/api/reports/save-report/save-links", saveLinks);

// import handleReportFoldering from "./api/reports/save-report/handle-report-foldering.js";
// app.use(
//   "/api/reports/save-report/handle-report-foldering",
//   handleReportFoldering
// );

// import regenerateFolderName from "./api/reports/regenerate-folder/regenerate-folder-name.js";
// app.use(
//   "/api/reports/save-report/regenerate-folder-name",
//   regenerateFolderName
// );

// import generateFolderImagePrompt from "./api/reports/regenerate-folder/generate-folder-image-prompt.js";
// app.use(
//   "/api/reports/save-report/generate-folder-image-prompt",
//   generateFolderImagePrompt
// );

// import generateFolderImage from "./api/reports/regenerate-folder/generate-folder-image.js";
// app.use("/api/reports/save-report/generate-folder-image", generateFolderImage);

// import uploadFolderImageToCloudinary from "./api/reports/regenerate-folder/upload-folder-image-to-cloudinary.js";
// app.use(
//   "/api/reports/save-report/upload-folder-image-to-cloudinary",
//   uploadFolderImageToCloudinary
// );

// import saveFolderNameAndImage from "./api/reports/regenerate-folder/save-folder-name-and-image.js";
// app.use(
//   "/api/reports/save-report/save-folder-name-and-image",
//   saveFolderNameAndImage
// );

// import startGenerateContinuumTasks from "./api/reports/save-report/start-generate-continua-tasks.js";
// app.use(
//   "/api/reports/save-report/start-generate-continua-tasks",
//   startGenerateContinuumTasks
// );

// ///////////////////////////////////////////////////////
// // Continua
// ///////////////////////////////////////////////////////
// import generateResearchLinks from "./api/reports/continua/generate-research-links.js";
// app.use("/api/reports/continua/generate-research-links", generateResearchLinks);

// import queueSaveReportTask from "./api/reports/continua/queue-save-report-task.js";
// app.use("/api/reports/continua/queue-save-report-task", queueSaveReportTask);

///////////////////////////////////////////////////////
// Root
///////////////////////////////////////////////////////

app.get("/", async (req, res) => {
  try {
    console.log("Hello");
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
