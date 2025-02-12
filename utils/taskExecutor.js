import taskSchema from "./taskSchema.js";
import saveToFirebase from "./saveToFirebase.js";
async function findTaskDefinition(taskName) {
  const taskSchemaDefinition = taskSchema();

  if (!taskSchemaDefinition) {
    console.error("❌ ERROR: taskSchema() returned undefined.");
    return null;
  }

  let taskDefinition;

  for (const topLevelTaskName in taskSchemaDefinition) {
    const topLevelTask = taskSchemaDefinition[topLevelTaskName];

    if (topLevelTaskName === taskName) {
      console.log(`✅ Found task definition for: ${taskName}`);
      taskDefinition = topLevelTask;
      break;
    }

    if (topLevelTask.subtasks) {
      for (const subtask of topLevelTask.subtasks) {
        if (subtask.taskName === taskName) {
          console.log(`✅ Found subtask definition for: ${taskName}`);
          taskDefinition = subtask;
          break;
        }
      }
    }

    if (taskDefinition) break;
  }

  if (!taskDefinition) {
    console.error(`❌ ERROR: No task definition found for ${taskName}`);
  }

  return taskDefinition;
}

async function executeTask(taskName, inputs) {
  console.log(`🔄 Running task: ${taskName}`);

  const taskDefinition = await findTaskDefinition(taskName);

  if (!taskDefinition) {
    console.error(`❌ ERROR 3454: Missing taskDefinition for ${taskName}`);
    return {};
  }

  if (!taskDefinition.function) {
    console.error(`❌ ERROR 3455: Missing function for ${taskName}`);
    console.log(`taskDefinition: ${JSON.stringify(taskDefinition, null, 2)}`);
    return {};
  }

  console.log(`✅ Executing function for task: ${taskName}`);
  return await taskDefinition.function({ body: inputs });
}

async function executeSubtasks(
  subtasks,
  context,
  firebaseRef,
  userId,
  taskType
) {
  async function clearSubtasks() {
    const clearSubtasksFirebasePath = `${firebaseRef}/${process.env.SERVER_UID}/${userId}/${taskType}/subtasks/`;
    await saveToFirebase(clearSubtasksFirebasePath, {});
  }
  await clearSubtasks();
  for (const subtask of subtasks) {
    // Update Firebase with the current subtask
    const createdAtFirebasePath = `${firebaseRef}/${process.env.SERVER_UID}/${userId}/${taskType}/subtasks/${subtask.taskName}/createdAt`;
    await saveToFirebase(createdAtFirebasePath, `${new Date().toISOString()}`);

    const inputs = subtask.inputs.reduce((acc, inputKey) => {
      acc[inputKey] = context[inputKey] || "";
      return acc;
    }, {});

    const output = await executeTask(subtask.taskName, inputs);
    context = { ...context, ...output };

    const completedAtFirebasePath = `${firebaseRef}/${process.env.SERVER_UID}/${userId}/${taskType}/subtasks/${subtask.taskName}/completedAt`;
    await saveToFirebase(
      completedAtFirebasePath,
      `${new Date().toISOString()}`
    );
  }

  return context;
}

export async function taskExecutor({
  taskName,
  taskData,
  taskContext,
  userId,
  taskType,
}) {
  let accumulatedContext = { ...taskContext, ...taskData.context };

  const outputData = await executeTask(taskName, accumulatedContext);
  accumulatedContext = { ...accumulatedContext, ...outputData };

  const taskDefinition = taskSchema()[taskName];
  if (taskDefinition.subtasks) {
    accumulatedContext = await executeSubtasks(
      taskDefinition.subtasks,
      accumulatedContext,
      `/${"asyncTasks"}`,
      userId,
      taskType
    );
  }

  return accumulatedContext;
}
