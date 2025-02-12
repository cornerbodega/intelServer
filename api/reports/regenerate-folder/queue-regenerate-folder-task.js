// @author Marvin-Rhone

import { addTaskToQueue } from "../../../utils/queue.js";
import { getSupabase } from "../../../utils/supabase.js";

export default async function handler(req, res) {
  console.log("QUEUE SAVE REGENERATE FOLDER TASK ENDPOINT");

  console.log(req.body);
  const { userId, folderId, currentGeneration, maxGenerations } = req.body;
  const supabase = getSupabase();

  try {
    const { data: foldersResponse, error } = await supabase
      .from("folders")
      .select("folderPicUrl")
      .eq("folderId", folderId);

    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Database query failed." });
    }

    if (foldersResponse && foldersResponse[0]?.folderPicUrl) {
      console.log("folderPicUrl exists - skipping regeneration.");
      return res.status(200).json({ message: "Folder image already exists." });
    }
  } catch (error) {
    console.log("Database error:", error);
    return res.status(500).json({ error: "Error checking folder data." });
  }

  try {
    // ✅ New Task Object (Same Format as Before)
    const newTask = {
      type: "regenerateFolder",
      status: "queued",
      userId,
      context: { folderId },
      createdAt: new Date().toISOString(),
    };

    // ✅ Queue Task in Redis Instead of Firebase
    await addTaskToQueue("regenerateFolder", newTask);

    console.log("Task successfully queued in Redis (BullMQ)");
    return res.status(200).json({ message: "Task queued successfully." });
  } catch (error) {
    console.error("Error queuing the task:", error.message);
    return res.status(500).json({ error: "Task queuing failed." });
  }
}
