import taskSchema from "./taskSchema.js";

async function findTaskDefinition(taskName) {
  const taskSchemaDefinition = taskSchema();
  let taskDefinition;

  for (const topLevelTaskName in taskSchemaDefinition) {
    const topLevelTask = taskSchemaDefinition[topLevelTaskName];
    if (topLevelTaskName === taskName) {
      taskDefinition = topLevelTask;
      break;
    }

    if (topLevelTask.subtasks) {
      for (const subtask of topLevelTask.subtasks) {
        if (subtask.taskName === taskName) {
          taskDefinition = subtask;
          break;
        }
      }
    }

    if (taskDefinition) break;
  }

  return taskDefinition;
}

async function executeTask(taskName, inputs) {
  const taskDefinition = await findTaskDefinition(taskName);

  console.log("taskDefinition");
  console.log("inputs");
  console.log(inputs);
  console.log(`currentGeneration: ${inputs.currentGeneration}`);
  console.log(`maxGenerations: ${inputs.maxGenerations}`);
  if (inputs.currentGeneration > inputs.maxGenerations) {
    console.log("currentGeneration > maxGenerations. not executing task");
    return;
  }
  if (!taskDefinition) {
    console.log("error 3454: missing taskDefinition for");
    console.log(taskName);
    return;
  }

  if (taskDefinition.function) {
    return await taskDefinition.function({ body: inputs });
    // } else if (taskDefinition.endpoint) {
    //   const handler = import `{taskDefinition.endpoint}.js`
    //   await hander(inputs)
    //   return await fetch(
    //     // CAN I CALL THIS SERVER INTERNALLY HERE ? yes
    //     `${}`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(inputs),
    //     }
    //   )
    //     .then((response) => response.json())
    //     .catch((error) => {
    //       console.log("task executor error");
    //       console.log(error);
    //     });
  }
}

async function executeSubtasks(subtasks, context) {
  for (const subtask of subtasks) {
    const inputs = subtask.inputs.reduce((acc, inputKey) => {
      acc[inputKey] = context[inputKey] || "";
      return acc;
    }, {});

    const output = await executeTask(subtask.taskName, inputs);
    context = { ...context, ...output };
  }

  return context;
}

export async function taskExecutor({ taskName, taskData, taskContext }) {
  let accumulatedContext = { ...taskContext, ...taskData.context };

  const outputData = await executeTask(taskName, accumulatedContext);
  accumulatedContext = { ...accumulatedContext, ...outputData };

  const taskDefinition = taskSchema()[taskName];
  if (taskDefinition.subtasks) {
    accumulatedContext = await executeSubtasks(
      taskDefinition.subtasks,
      accumulatedContext
    );
  }

  console.log("accumulatedContext");
  console.log(accumulatedContext);

  return accumulatedContext;
}

// import { saveToFirebase } from "./saveToFirebase";
// import taskSchema from "./taskSchema";

// async function findTaskDefinition(taskName) {
//   const taskSchemaDefinition = taskSchema();
//   let taskDefinition;

//   for (const topLevelTaskName in taskSchemaDefinition) {
//     const topLevelTask = taskSchemaDefinition[topLevelTaskName];
//     if (topLevelTaskName === taskName) {
//       taskDefinition = topLevelTask;
//       break;
//     }

//     if (topLevelTask.subtasks) {
//       for (const subtask of topLevelTask.subtasks) {
//         if (subtask.taskName === taskName) {
//           taskDefinition = subtask;
//           break;
//         }
//       }
//     }

//     if (taskDefinition) break;
//   }

//   return taskDefinition;
// }

// async function executeTask(taskName, inputs) {
//   const taskDefinition = await findTaskDefinition(taskName);

//   console.log("taskDefinition");
//   if (!taskDefinition) {
//     console.log("error 3454: missing taskDefinition for");
//     console.log(taskName);
//     return;
//   }

//   if (taskDefinition.function) {
//     return await taskDefinition.function(inputs);
//   } else if (taskDefinition.endpoint) {
//     return await fetch(taskDefinition.endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(inputs),
//     }).then((response) => response.json());
//   }
// }

// async function executeSubtasks(subtasks, context) {
//   for (const subtask of subtasks) {
//     const inputs = subtask.inputs.reduce((acc, inputKey) => {
//       acc[inputKey] = context[inputKey];
//       return acc;
//     }, {});

//     const output = await executeTask(subtask.taskName, inputs);
//     context = { ...context, ...output };
//   }

//   return context;
// }
// async function handleContinuumLogic(context, taskName, taskData) {
//   if (context.generation < context.totalGenerations) {
//     const nextGenerationTask = {
//       ...taskData,
//       context: {
//         ...context,
//         generation: context.generation++,
//       },
//     };

//     await saveToFirebase(
//       `asyncTasks/${context.userId}/${taskName}`,
//       nextGenerationTask
//     );
//   }
// }
// // async function handleContinuumLogic(context, taskName, taskData) {
// //   if (context.generation < context.totalGenerations) {
// //     const nextGenerationTask = {
// //       ...taskData,
// //       context,
// //     };

// //     await saveToFirebase(
// //       `asyncTasks/${context.userId}/${taskName}`,
// //       nextGenerationTask
// //     );
// //   }
// // }

// export async function taskExecutor({ taskName, taskData, taskContext }) {
//   taskData.context.generation += 1;
//   let accumulatedContext = { ...taskContext, ...taskData.context };

//   const outputData = await executeTask(taskName, accumulatedContext);
//   accumulatedContext = { ...accumulatedContext, ...outputData };

//   const taskDefinition = taskSchema()[taskName];
//   if (taskDefinition.subtasks) {
//     accumulatedContext = await executeSubtasks(
//       taskDefinition.subtasks,
//       accumulatedContext
//     );
//   }

//   console.log("accumulatedContext2");
//   console.log(accumulatedContext);

//   await handleContinuumLogic(accumulatedContext, taskName, taskData);

//   return accumulatedContext;
// }

// // export async function taskExecutor({ taskName, taskData, taskContext }) {
// //   taskData.context.generation += 1;
// //   const taskDefinition = taskSchema()[taskName];
// //   // Making sure that context is not nested
// //   console.log("taskData.context");
// //   console.log(taskData.context);
// //   //   return;
// //   let accumulatedContext = { ...taskContext, ...taskData.context };

// //   //   const outputData = await taskDefinition.function(accumulatedContext);
// //   const outputData = await fetch(taskDefinition.endpoint, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify(accumulatedContext),
// //   }).then((response) => response.json());

// //   accumulatedContext = { ...accumulatedContext, ...outputData };

// //   if (taskDefinition.subtasks) {
// //     for (const subtask of taskDefinition.subtasks) {
// //       const subtaskInputs = subtask.inputs.reduce((acc, inputKey) => {
// //         acc[inputKey] = accumulatedContext[inputKey];
// //         return acc;
// //       }, {});
// //       //   const subtaskOutput = await subtask.function(subtaskInputs);
// //       let subtaskOutput;
// //       if (subtask.endpoint) {
// //         subtaskOutput = await fetch(subtask.endpoint, {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify(subtaskInputs),
// //         }).then((response) => response.json());
// //       } else if (subtask.function) {
// //         subtaskOutput = await subtask.function(subtaskInputs);
// //       }
// //       accumulatedContext = { ...accumulatedContext, ...subtaskOutput };
// //     }
// //   }

// //   console.log("accumulatedContext1");
// //   console.log(accumulatedContext);

// //   accumulatedContext = {
// //     ...accumulatedContext,
// //     ...taskContext,
// //     ...taskData.context,
// //     generation: taskData.context.generation, // Increment the generation count
// //     // ... (any other context updates)
// //   };
// //   console.log("accumulatedContext2");
// //   console.log(accumulatedContext);

// //   // Continuum logic to queue next generation task, if necessary
// //   if (accumulatedContext.generation < accumulatedContext.totalGenerations) {
// //     console.log("TASK EXECUTOR CONTINUUM LOGIC ACTIVATED");
// //     console.log("taskData1", taskData);
// //     const nextGenerationTask = {
// //       ...taskData,
// //       //   generation: accumulatedContext.generation,
// //       context: accumulatedContext, // Update context here directly
// //     };
// //     await saveToFirebase(
// //       `asyncTasks/${accumulatedContext.userId}/${taskName}`,
// //       nextGenerationTask
// //     );
// //   }

// //   return accumulatedContext;
// // }
