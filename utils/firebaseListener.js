import firebase from "./firebase.js";
import { runTransaction, ref, onValue } from "firebase/database";
import taskSchema from "./taskSchema.js";
import { taskExecutor } from "./taskExecutor.js";
const db = firebase.db;
import "dotenv/config";
import signServerIntoFirebase from "./signServerIntoFirebase.js";

export default function setupFirebaseListener() {
  console.log("SETUP FIREBASE LISTENER");

  signServerIntoFirebase().then(async (userCredential) => {
    // wait for a random interval up to 0.5 seconds before processing the task
    const taskRef = ref(db, `/${"asyncTasks"}/${process.env.SERVER_UID}/`);

    // Debounce function
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Debounced onValue callback
    const debouncedOnValue = debounce(async (snapshot) => {
      const allUserTasks = snapshot.val();
      if (!allUserTasks) {
        return;
      }

      if (!allUserTasks) {
        return;
      }

      for (let userId in allUserTasks) {
        const userTasks = allUserTasks[userId];

        for (let taskType in userTasks) {
          const taskData = userTasks[taskType];

          if (taskData.status === "queued") {
            console.log("FIREBASE LISTENER ACTIVATED FOR USER:", userId);

            // Transaction to update task status to 'in-progress' ONLY if still queued
            const taskStatusRef = ref(
              db,
              `/${"asyncTasks"}/${
                process.env.SERVER_UID
              }/${userId}/${taskType}/status`
            );

            // Atomic check-and-set: only update if status is still "queued"
            const { committed } = await runTransaction(taskStatusRef, (currentStatus) => {
              if (currentStatus === "queued") {
                return "in-progress";
              }
              // Abort transaction if status changed (another process picked it up)
              return undefined;
            });

            // Skip if transaction wasn't committed (task already picked up)
            if (!committed) {
              console.log(`Task ${taskType} for user ${userId} already being processed, skipping...`);
              continue;
            }

            const taskDefinition = taskSchema()[taskType];
            if (!taskDefinition) {
              console.error(
                `Task definition not found for task type: ${taskType}`
              );
              return;
            }

            try {
              const updatedContext = await taskExecutor({
                taskName: taskType,
                taskData: taskData,
                taskContext: {},
                taskDefinition,
                userId: userId,
                taskType: taskType,
              });

              if (
                !updatedContext ||
                JSON.stringify(taskData.context) ===
                  JSON.stringify(updatedContext)
              ) {
                console.log("No changed context returned from task executor.");
                return;
              }

              // Transaction to update task status to 'complete'
              await runTransaction(taskStatusRef, () => "complete");

              // Additional transactions for saving completedAt and context
              const taskCompletedAtRef = ref(
                db,
                `/${"asyncTasks"}/${
                  process.env.SERVER_UID
                }/${userId}/${taskType}/completedAt`
              );
              await runTransaction(taskCompletedAtRef, () =>
                new Date().toISOString()
              );

              const taskContextRef = ref(
                db,
                `/${"asyncTasks"}/${
                  process.env.SERVER_UID
                }/${userId}/${taskType}/context`
              );
              await runTransaction(taskContextRef, () => updatedContext);
            } catch (error) {
              console.log("Error processing task for user:", userId);
              console.log(error);

              // Transaction to update error status and message
              await runTransaction(taskStatusRef, () => "error");
              const taskErrorMessageRef = ref(
                db,
                `/${"asyncTasks"}/${
                  process.env.SERVER_UID
                }/${userId}/${taskType}/errorMessage`
              );
              await runTransaction(
                taskErrorMessageRef,
                () => error.message || "Unknown error"
              );
            }
          }
        }
      }
    }, 500); // Wait for 500ms before processing the task

    // Apply debounced callback to onValue
    onValue(taskRef, debouncedOnValue);
  });
}
