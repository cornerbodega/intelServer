import { runTransaction } from "firebase/database";
import firebase from "./firebase.js";
import { onValue, set } from "firebase/database";
import taskSchema from "./taskSchema.js";
import { taskExecutor } from "./taskExecutor.js";
// import { isActiveTab } from "./activeTab";
const db = firebase.db;
const ref = firebase.ref;
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import saveToFirebase from "./saveToFirebase.js";
export default function setupFirebaseListener() {
  console.log("SETUP FIREBASE LISTENER");
  function signServerIntoFirebase() {
    const email = "merhone@gmail.com";
    const password = "suzi99";
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
  }
  signServerIntoFirebase().then(async (userCredential) => {
    const taskRef = ref(
      db,
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.serverUid
      }/`
    );
    onValue(taskRef, async (snapshot) => {
      const allUserTasks = snapshot.val();

      if (!allUserTasks) {
        return;
      }

      // Inside the onValue callback
      for (let userId in allUserTasks) {
        const userTasks = allUserTasks[userId];

        for (let taskType in userTasks) {
          const taskData = userTasks[taskType];

          // Only proceed if the task status is 'queued'
          if (taskData.status === "queued") {
            console.log("FIREBASE LISTENER ACTIVATED FOR USER:", userId);

            // Define the reference to the specific task's status
            const taskStatusRef = ref(
              db,
              `/${
                process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
              }/${process.env.serverUid}/${userId}/${taskType}/status`
            );

            runTransaction(taskStatusRef, (currentStatus) => {
              if (currentStatus === "queued") {
                // Update the status to 'in-progress'
                return "in-progress";
              }
              // Returning undefined aborts the transaction
              return undefined;
            })
              .then(async (result) => {
                if (result.committed) {
                  // Transaction was successful, and the status was set to 'in-progress'
                  // Now execute the task
                  try {
                    const taskDefinition = taskSchema()[taskType];
                    if (!taskDefinition) {
                      console.error(
                        `Task definition not found for task type: ${taskType}`
                      );
                      return;
                    }

                    const updatedContext = await taskExecutor({
                      taskName: taskType,
                      taskData: taskData,
                      taskContext: {},
                      taskDefinition,
                      userId: userId,
                      taskType: taskType,
                    });

                    // Further processing, saving completion status, etc.
                  } catch (error) {
                    console.log("Error processing task for user:", userId);
                    console.log(error);
                    // Handle errors
                  }
                } else {
                  // Transaction was aborted or the task was already in progress/complete
                  console.log(
                    "Task is already being processed or was completed."
                  );
                }
              })
              .catch((error) => {
                console.error("Transaction failed: ", error);
              });
          }
        }
      }
    });
  });
}
