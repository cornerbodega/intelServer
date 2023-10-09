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
    const taskRef = ref(db, `asyncTasks/${process.env.serverUid}/`);
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

            const taskDefinition = taskSchema()[taskType];
            if (!taskDefinition) {
              console.error(
                `Task definition not found for task type: ${taskType}`
              );
              return;
            }

            try {
              const saveStatusInProgress = await saveToFirebase(
                `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/status`,
                "in-progress"
              );

              const updatedContext = await taskExecutor({
                taskName: taskType,
                taskData: taskData,
                taskContext: {},
                taskDefinition,
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
                `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/status`,
                "complete"
              );

              const saveCompletedAt = await saveToFirebase(
                `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/completedAt`,
                new Date().toISOString()
              );

              const saveContext = await saveToFirebase(
                `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/context`,
                updatedContext
              );
            } catch (error) {
              console.log("Error processing task for user:", userId);
              console.log(error);

              const saveStatusError = await saveToFirebase(
                `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/status`,
                "error"
              );

              const saveErrorMessage = await saveToFirebase(
                `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/errorMessage`,
                error.message || "Unknown error"
              );
            }
          }
        }
      }
    });
  });

  // signServerIntoFirebase().then(async (userCredential) => {
  //   const taskRef = ref(db, `asyncTasks/${process.env.serverUid}/`);
  //   onValue(taskRef, async (snapshot) => {
  //     const allUserTasks = snapshot.val();

  //     // If there's no data at all, just return
  //     if (!allUserTasks) {
  //       return;
  //     }

  //     // Loop through each user's set of tasks
  //     for (let userId in allUserTasks) {
  //       const userTasks = allUserTasks[userId];

  //       // For each user, loop through their tasks by taskType
  //       for (let taskType in userTasks) {
  //         const taskData = userTasks[taskType];

  //         // Now that you have the individual taskData, you can process it
  //         if (taskData.status === "queued") {
  //           console.log("FIREBASE LISTENER ACTIVATED FOR USER:", userId);
  //           console.log("taskData:", taskData);
  //           console.log("taskType:", taskType);

  //           const taskDefinition = taskSchema()[taskType];
  //           if (!taskDefinition) {
  //             console.error(
  //               `Task definition not found for task type: ${taskType}`
  //             );
  //             return;
  //           }

  //           const updatedStatusToInProgress = await set(
  //             ref(
  //               db,
  //               `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/status`
  //             ),
  //             "in-progress"
  //           );
  //           try {
  //             const updatedContext = await taskExecutor({
  //               taskName: taskType,
  //               taskData: taskData,
  //               taskContext: {},
  //               taskDefinition,
  //             });

  //             if (!updatedContext) {
  //               console.log("Nothing returned from task executor.");
  //               return;
  //             }

  //             if (
  //               JSON.stringify(taskData.context) ===
  //               JSON.stringify(updatedContext)
  //             ) {
  //               console.log("No changed context returned from task executor.");
  //               return;
  //             }

  //             const updatedStatusToComplete = await set(
  //               ref(
  //                 db,
  //                 `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/status`
  //               ),
  //               "complete"
  //             );

  //             const updatedStatusCompletedAt = await set(
  //               ref(
  //                 db,
  //                 `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/completedAt`
  //               ),
  //               new Date().toISOString()
  //             );

  //             const updatedStatusContext = await set(
  //               ref(
  //                 db,
  //                 `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/context`
  //               ),
  //               updatedContext
  //             );
  //           } catch (error) {
  //             const updatedStatusError = await set(
  //               ref(
  //                 db,
  //                 `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/status`
  //               ),
  //               "error"
  //             );
  //             console.log("Error processing task for user:", userId);
  //             console.log(error);
  //             const updatedStatusErrorMessage = await set(
  //               ref(
  //                 db,
  //                 `/asyncTasks/${process.env.serverUid}/${userId}/${taskType}/errorMessage`
  //               ),
  //               error.message || "Unknown error"
  //             );
  //           }
  //         }
  //       }
  //     }
  //   });
  // });
  // onValue(taskRef, async (snapshot) => {
  //   if (!snapshot.val()) {
  //     return;
  //   }
  //   console.log("Object.keys(snapshot.val())");
  //   console.log(Object.keys(snapshot.val()));
  //   if (Object.keys(snapshot.val()).length === 0) {
  //     return;
  //   }
  //   console.log("snapshot.val()");
  //   console.log(snapshot.val());
  //   const asyncTasksByUserId = snapshot.val();
  //   const asyncTasks =
  //   const taskNames = Object.keys(asyncTasks);
  //   console.log(taskNames);
  //   console.log(taskNames.length);
  //   for (let i = 0; i < taskNames.length; i++) {
  //     console.log("i");
  //     console.log(i);

  //     const taskData = asyncTasks[taskNames[i]];
  //     if (i > 0) {
  //       console.log("taskData loopp");
  //       console.log(taskData);
  //     }
  //     const taskType = taskData.type; // Assuming task type is stored as the key
  //     const taskDefinition = taskSchema()[taskType];
  //     console.log("taskData.status");
  //     console.log(taskData.status);
  //     if (taskData.status === "queued") {
  //       console.log("FIREBASE LISTENER ACTIVATED");
  //       console.log("taskData", taskData);
  //       console.log("taskType", taskType);
  //       console.log("firebase context", taskData.context);

  //       console.log("taskDefinition", taskDefinition);
  //       if (!taskDefinition) {
  //         console.error(`Task definition not found for task type: ${taskType}`);
  //         return;
  //       }

  //       const updatedStatusToInProgress = await set(
  //         ref(db, `/asyncTasks/${process.env.serverUid}/${user.sub}/${taskType}/status`),
  //         "in-progress"
  //       );
  //       try {
  //         const updatedContext = await taskExecutor({
  //           taskName: taskType,
  //           taskData: taskData,
  //           taskContext: {},
  //           taskDefinition,
  //         });
  //         console.log("updatedContext");
  //         console.log(updatedContext);
  //         if (!updatedContext) {
  //           return console.log(
  //             "Nothing returned from task executor. This is not an active tab."
  //           );
  //         }
  //         if (
  //           JSON.stringify(taskData.context) === JSON.stringify(updatedContext)
  //         ) {
  //           return console.log(
  //             "No changed context returned from task executor. This is not an active tab."
  //           );
  //         }
  //         const updatedStatusToComplete = await set(
  //           ref(db, `/asyncTasks/${process.env.serverUid}/${user.sub}/${taskType}/status`),
  //           "complete"
  //         );

  //         const updatedStatusCompletedAt = await set(
  //           ref(db, `/asyncTasks/${process.env.serverUid}/${user.sub}/${taskType}/completedAt`),
  //           new Date().toISOString()
  //         );
  //         const updatedStatusContext = await set(
  //           ref(db, `/asyncTasks/${process.env.serverUid}/${user.sub}/${taskType}/context`),
  //           updatedContext
  //         );

  //         // The Next.js client queries Supabase to retrieve updated data
  //         // await querySupabase(taskType, updatedContext);
  //       } catch (error) {
  //         const updatedStatusError = await set(
  //           ref(db, `/asyncTasks/${process.env.serverUid}/${user.sub}/${taskType}/status`),
  //           "error"
  //         );
  //         console.log("firebase listener error");
  //         console.log(error);
  //         const updatedStatusErrorMessage = await set(
  //           ref(db, `/asyncTasks/${process.env.serverUid}/${user.sub}/${taskType}/errorMessage`),
  //           error
  //         );
  //       }
  //     }
  //   }
  // });
}
