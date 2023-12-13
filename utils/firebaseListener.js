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

      for (let userId in allUserTasks) {
        const userTasks = allUserTasks[userId];

        for (let taskType in userTasks) {
          const taskData = userTasks[taskType];

          if (taskData.status === "queued") {
            console.log("FIREBASE LISTENER ACTIVATED FOR USER:", userId);

            try {
              const saveStatusInProgress = await saveToFirebase(
                `/${
                  process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
                }/${process.env.serverUid}/${userId}/${taskType}/status`,
                "in-progress"
              );
            } catch {
              console.log("error saving status in progress");
            }

            const taskDefinition = taskSchema()[taskType];
            if (!taskDefinition) {
              console.error(
                `Task definition not found for task type: ${taskType}`
              );
              return;
            }

            try {
              // const updatedContext = await taskExecutor({
              //   taskName: taskType,
              //   taskData: taskData,
              //   taskContext: {},
              //   taskDefinition,
              // });
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

              const saveStatusComplete = await saveToFirebase(
                `/${
                  process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
                }/${process.env.serverUid}/${userId}/${taskType}/status`,
                "complete"
              );

              const saveCompletedAt = await saveToFirebase(
                `/${
                  process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
                }/${process.env.serverUid}/${userId}/${taskType}/completedAt`,
                new Date().toISOString()
              );

              const saveContext = await saveToFirebase(
                `/${
                  process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
                }/${process.env.serverUid}/${userId}/${taskType}/context`,
                updatedContext
              );
            } catch (error) {
              console.log("Error processing task for user:", userId);
              console.log(error);

              const saveStatusError = await saveToFirebase(
                `/${
                  process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
                }/${process.env.serverUid}/${userId}/${taskType}/status`,
                "error"
              );

              const saveErrorMessage = await saveToFirebase(
                `/${
                  process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
                }/${process.env.serverUid}/${userId}/${taskType}/errorMessage`,
                error.message || "Unknown error"
              );
            }
          }
        }
      }
    });
  });
}
