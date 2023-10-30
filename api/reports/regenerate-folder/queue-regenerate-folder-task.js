// @author Marvin-Rhone

// import { max } from "lodash";
import saveToFirebase from "../../../utils/saveToFirebase.js";
import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  console.log("QUEUE SAVE REGENERATE FOLDER TASK ENDPOINT");
  // const { draft, researchLink1, researchLink2, researchLink3 } = req.body;
  console.log(req.body);
  const { userId, folderId, currentGeneration, maxGenerations } = req.body;
  // this conditional should allow doContinuum to regenerate the folder only once
  // finalizeAndVisualize should regenerate the folder
  // doContinuum shouldn't have to
  // if (currentGeneration) {
  //   if (+currentGeneration != +maxGenerations) {
  //     return console.log(
  //       "currentGeneration != maxGenerations. skipping folder regeneration"
  //     );
  //   } else {
  //     console.log("currentGeneration == maxGenerations. regenerating folder");
  //   }
  // }
  // check if the folder id has a folderPicUrl
  // async function getExistingFolderData() {
  const supabase = getSupabase();
  try {
    const { foldersResponse, error } = await supabase
      .from("folders")
      .select("folderPicUrl")
      .eq("folderId", folderId);
    if (error) {
      console.log(error);
    }
    if (foldersResponse) {
      if (foldersResponse[0]) {
        if (foldersResponse[0].folderPicUrl) {
          console.log("folderPicUrl exists");
          return;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
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
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.serverUid
      }/${userId}/regenerateFolder`,
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
