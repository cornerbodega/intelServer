// @author Marvin-Rhone

import saveToFirebase from "../../utils/saveToFirebase.js";

export default async function handler(req, res) {
  console.log("SAVE TASK ENDPOINT");
  console.log(req.body);
  //   const newTask = {
  //     type: "writeDraftReport",
  //     status: "queued",
  //     userId: user.sub,
  //     context: {
  //       ...draftData,
  //       userId: user.sub,
  //     },
  //     createdAt: new Date().toISOString(),
  //   };

  const { userId, type } = req.body;
  console.log("process.env.localAsyncTasks");
  console.log(process.env.localAsyncTasks);
  const saveTaskRef = await saveToFirebase(
    `/${
      process.env.localAsyncTasks ? process.env.localAsyncTasks : "asyncTasks"
    }/${process.env.serverUid}/${userId}/${type}/`,
    req.body
  );
  console.log("saveTaskRef");
  console.log(saveTaskRef);

  res.status(200).json({ status: 200, message: "Task saved successfully" });
  //   return { status: 200, message: "Task saved successfully" };
}
