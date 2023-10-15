// @author Marvin-Rhone

import getFromOpenAi from "../../../utils/getFromOpenAi.js";
import saveToFirebase from "../../../utils/saveToFirebase.js";
// import { getSuggestionFunction } from "../../get-suggestion";

export default async function handler(req, res) {
  console.log("QUEUE SAVE REPORT TASK ENDPOINT");
  // const { draft, researchLink1, researchLink2, researchLink3 } = req.body;
  console.log(req.body);
  const {
    draft1,
    draft2,
    draft3,
    researchLink1,
    researchLink2,
    researchLink3,
    agentId,
    expertises,
    specializedTraining,
    userId,
    maxGenerations,
    currentGeneration,
  } = req.body;
  let reportData = { ...req.body };
  let researchLink = {};
  if (researchLink1) {
    researchLink = researchLink1;
  }
  if (researchLink2) {
    researchLink = researchLink2;
  }
  if (researchLink3) {
    researchLink = researchLink3;
  }
  let draft = draft1;
  if (draft2) {
    draft = draft2;
  }
  if (draft3) {
    draft = draft3;
  }

  const parentReportId = researchLink.parentReportId;
  const highlightedText = researchLink.highlightedText;
  const elementId = researchLink.elementId;
  if (parentReportId) {
    reportData.parentReportId = parentReportId;
  }
  if (highlightedText) {
    reportData.highlightedText = highlightedText;
  }
  if (elementId) {
    reportData.elementId = elementId;
  }
  // setWriteDraftTaskId(crypto.randomUUID());
  // const specializedTraining = agent.specializedTraining;
  if (specializedTraining) {
    reportData.specializedTraining = specializedTraining;
  }
  try {
    const newTask = {
      // taskId: writeDraftTaskId,
      type: "saveReport",
      status: "queued",
      userId,
      context: {
        ...reportData,
        draft,
        agentId,
        expertises,
        userId,
      },
      createdAt: new Date().toISOString(),
    };

    const saveTaskRef = await saveToFirebase(
      `/${
        process.env.localAsyncTasks ? process.env.localAsyncTasks : "asyncTasks"
      }/${process.env.serverUid}/${userId}/saveReport`,
      newTask
    );

    if (saveTaskRef) {
      // setWriteDraftTaskId(newTaskRef.key); // Store the task ID to set up the listener
      console.log("saveTaskRef");
      console.log(saveTaskRef);
      return { saveTaskRef };
    } else {
      console.error("Failed to queue the task.");
    }
  } catch (error) {
    console.error("Error queuing the task:", error.message);
  } finally {
    // setIsSubmitting(false);
    // clearInterval(notificationIntervalId); // Clear the interval properly
    // setNotificationMessages([]);
  }
  // save a new save report task to firebase
  // make sure the generations are decremented and under the limit
  // otherwise do nothing or return an error
}
