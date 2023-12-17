import firebase from "./firebase.js";
import { onValue, runTransaction } from "firebase/database";
import taskSchema from "./taskSchema.js";
import { taskExecutor } from "./taskExecutor.js";
const db = firebase.db;
const ref = firebase.ref;
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function setupFirebaseListener() {
  console.log("SETUP FIREBASE LISTENER");

  function signServerIntoFirebase() {
    const email = "merhone@gmail.com";
    const password = "suzi99";
    // const email = process.env.FIREBASE_EMAIL;
    // const password = process.env.FIREBASE_PASSWORD;
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
          const individualTaskRef = ref(
            db,
            `/${
              process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
            }/${process.env.serverUid}/${userId}/${taskType}`
          );

          runTransaction(individualTaskRef, (currentTask) => {
            if (currentTask && currentTask.status === "queued") {
              // Change the status to 'in-progress'
              return { ...currentTask, status: "in-progress" };
            }
            // Returning undefined aborts the transaction
            return;
          })
            .then((result) => {
              if (result.committed) {
                // Transaction committed means status was successfully changed to 'in-progress'
                processTask(userId, taskType, userTasks[taskType]);
              } else {
                // Transaction aborted means task was already being processed or not in 'queued' state
                console.log(
                  `Task ${taskType} for user ${userId} is already in progress, error, or complete.`
                );
              }
            })
            .catch((error) => {
              console.error(
                `Transaction failed for task ${taskType} and user ${userId}: `,
                error
              );
            });
        }
      }
    });
  });
}

async function processTask(userId, taskType, taskData) {
  try {
    const taskDefinition = taskSchema()[taskType];
    if (!taskDefinition) {
      console.error(`Task definition not found for task type: ${taskType}`);
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

    // ... Rest of the task processing logic ...
  } catch (error) {
    console.log(
      `Error processing task ${taskType} for user ${userId}: `,
      error
    );
    // ... Error handling logic ...
  }
}

// import firebase from "./firebase.js";
// import { onValue, set } from "firebase/database";
// import taskSchema from "./taskSchema.js";
// import { taskExecutor } from "./taskExecutor.js";
// // import { isActiveTab } from "./activeTab";
// const db = firebase.db;
// const ref = firebase.ref;
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import saveToFirebase from "./saveToFirebase.js";
// export default function setupFirebaseListener() {
//   console.log("SETUP FIREBASE LISTENER");
//   function signServerIntoFirebase() {
//     const email = process.env.FIREBASE_EMAIL;
//     const password = process.env.FIREBASE_PASSWORD;

//     const auth = getAuth();
//     return signInWithEmailAndPassword(auth, email, password);
//   }
//   signServerIntoFirebase().then(async (userCredential) => {
//     const taskRef = ref(
//       db,
//       `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
//         process.env.serverUid
//       }/`
//     );
//     onValue(taskRef, async (snapshot) => {
//       const allUserTasks = snapshot.val();

//       if (!allUserTasks) {
//         return;
//       }

//       for (let userId in allUserTasks) {
//         const userTasks = allUserTasks[userId];

//         for (let taskType in userTasks) {
//           const taskData = userTasks[taskType];

//           if (taskData.status === "queued") {
//             console.log("FIREBASE LISTENER ACTIVATED FOR USER:", userId);

//             try {
//               const saveStatusInProgress = await saveToFirebase(
//                 `/${
//                   process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
//                 }/${process.env.serverUid}/${userId}/${taskType}/status`,
//                 "in-progress"
//               );
//             } catch {
//               console.log("error saving status in progress");
//             }

//             const taskDefinition = taskSchema()[taskType];
//             if (!taskDefinition) {
//               console.error(
//                 `Task definition not found for task type: ${taskType}`
//               );
//               return;
//             }

//             try {
//               // const updatedContext = await taskExecutor({
//               //   taskName: taskType,
//               //   taskData: taskData,
//               //   taskContext: {},
//               //   taskDefinition,
//               // });
//               const updatedContext = await taskExecutor({
//                 taskName: taskType,
//                 taskData: taskData,
//                 taskContext: {},
//                 taskDefinition,
//                 userId: userId,
//                 taskType: taskType,
//               });

//               if (
//                 !updatedContext ||
//                 JSON.stringify(taskData.context) ===
//                   JSON.stringify(updatedContext)
//               ) {
//                 console.log("No changed context returned from task executor.");
//                 return;
//               }

//               const saveStatusComplete = await saveToFirebase(
//                 `/${
//                   process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
//                 }/${process.env.serverUid}/${userId}/${taskType}/status`,
//                 "complete"
//               );

//               const saveCompletedAt = await saveToFirebase(
//                 `/${
//                   process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
//                 }/${process.env.serverUid}/${userId}/${taskType}/completedAt`,
//                 new Date().toISOString()
//               );

//               const saveContext = await saveToFirebase(
//                 `/${
//                   process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
//                 }/${process.env.serverUid}/${userId}/${taskType}/context`,
//                 updatedContext
//               );
//             } catch (error) {
//               console.log("Error processing task for user:", userId);
//               console.log(error);

//               const saveStatusError = await saveToFirebase(
//                 `/${
//                   process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
//                 }/${process.env.serverUid}/${userId}/${taskType}/status`,
//                 "error"
//               );

//               const saveErrorMessage = await saveToFirebase(
//                 `/${
//                   process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"
//                 }/${process.env.serverUid}/${userId}/${taskType}/errorMessage`,
//                 error.message || "Unknown error"
//               );
//             }
//           }
//         }
//       }
//     });
//   });
// }
