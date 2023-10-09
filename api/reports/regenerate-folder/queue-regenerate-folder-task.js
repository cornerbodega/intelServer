// @author Marvin-Rhone

// import { max } from "lodash";
import saveToFirebase from "../../../utils/saveToFirebase.js";

export default async function handler(req, res) {
  console.log("QUEUE SAVE REGENERATE FOLDER TASK ENDPOINT");
  // const { draft, researchLink1, researchLink2, researchLink3 } = req.body;
  console.log(req.body);
  const { userId, folderId } = req.body;
  // if (+currentGeneration != +maxGenerations || currentGeneration != 0) {
  //   return console.log(
  //     "currentGeneration != maxGenerations. skipping folder regeneration"
  //   );
  // } else {
  //   console.log("currentGeneration == maxGenerations. regenerating folder");
  // }
  try {
    const newTask = {
      // taskId: writeDraftTaskId,
      type: "regenerateFolder",
      status: "queued",
      userId,
      context: {
        folderId,
      },
      createdAt: new Date().toISOString(),
    };

    const saveTaskRef = await saveToFirebase(
      `asyncTasks/${process.env.serverUid}/${userId}/regenerateFolder`,
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
