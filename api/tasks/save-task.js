// @author Marvin-Rhone

import saveToFirebase from "../../utils/saveToFirebase.js";
import { addTaskToQueue } from "../../utils/queue.js";

export default async function handler(req, res) {
  console.log("SAVE TASK ENDPOINT");

  const { userId, type } = req.body;
  // Legacy code: save the task to Firebase. Still used by client
  const saveTaskRef = await saveToFirebase(
    `/${"asyncTasks"}/${process.env.SERVER_UID}/${userId}/${type}/`,
    req.body
  );

  // Instead of saving the task solely to Firebase,
  // add the task to the Redis queue for processing.
  // This is what actually triggers the task to be processed
  // await addTaskToQueue(type, req.body);

  res.status(200).json({ status: 200, message: "Task saved successfully" });
}
