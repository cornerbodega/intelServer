import saveToFirebase from "../../../utils/saveToFirebase.js";

export default async function handler(req, res) {
  console.log("START GENERATE CONTINUA TASKS ENDPOINT");
  //   const { childReportId, userId, generationsRemaining } = req.body;

  console.log(req.body);
  const { userId } = req.body;
  // "maxGenerations",
  // "currentGeneration",
  let newTaskContext = { ...req.body };
  newTaskContext.currentGeneration = +newTaskContext.currentGeneration || 1;
  newTaskContext.maxGenerations = +newTaskContext.maxGenerations || 1;
  console.log("newTaskContext.currentGeneration");
  console.log(newTaskContext.currentGeneration);
  console.log("newTaskContext.maxGenerations");
  console.log(newTaskContext.maxGenerations);
  if (newTaskContext.currentGeneration <= newTaskContext.maxGenerations) {
    try {
      const newTask = {
        type: "doContinuum",
        status: "queued",
        userId,
        context: {
          ...newTaskContext,
          parentReportId: newTaskContext.childReportId,
          userId,
        },
        createdAt: new Date().toISOString(),
      };

      const newTaskRef = await saveToFirebase(
        `asyncTasks/${userId}/doContinuum`,
        newTask
      );
    } catch (error) {
      console.log(error);
    }
    // const nextGenerationTask = {
    //   ...taskData,
    //   context: {
    //     ...context,
    //     currentGeneration: context.currentGeneration++,
    //   },
    // };
    // await saveToFirebase(
    //   `asyncTasks/${context.userId}/generateContinuumTasks`,
    //   nextGenerationTask
    // );
  }
  return {
    currentGeneration: newTaskContext.currentGeneration,
    maxGenerations: newTaskContext.maxGenerations,
  };
}
