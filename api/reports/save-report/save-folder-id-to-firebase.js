// @author Marvin-Rhone

// import { max } from "lodash";
import saveToFirebase from "../../../utils/saveToFirebase.js";

export default async function handler(req, res) {
  console.log("SAVE FOLDER ID TO FIREBASE ENDPOINT");
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
    // const newTask = {
    //   // taskId: writeDraftTaskId,
    //   type: "regenerateFolder",
    //   status: "queued",
    //   userId,
    //   context: {
    //     folderId,
    //   },
    //   createdAt: new Date().toISOString(),
    // };

    const saveFolderIdRef = await saveToFirebase(
      `/${
        process.env.localAsyncTasks ? process.env.localAsyncTasks : "asyncTasks"
      }/${
        process.env.serverUid
      }/${userId}/finalizeAndVisualizeReport/context/folderId`,
      folderId
    );

    if (saveFolderIdRef) {
      // setWriteDraftTaskId(newTaskRef.key); // Store the task ID to set up the listener
      console.log("saveFolderIdRef");
      console.log(saveFolderIdRef);
      return { saveFolderIdRef };
    } else {
      console.error("Failed to save the folder id.");
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
