// @author Marvin-Rhone
import saveToSupabase from "../../../utils/saveToSupabase.js";
import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  const { parentReportId, childReportId, userId } = req.body;

  console.log("[handleReportFoldering] Input:", { parentReportId, childReportId, userId });

  const reportId = childReportId;
  let newReportFolderModel = {};
  let existingFolderId;

  async function saveNewFolderModel(newReportFolderModel) {
    return await saveToSupabase("reportFolders", newReportFolderModel).catch(
      (error) => console.log(error)
    );
  }

  const createNewFolder = async () => {
    console.log("[handleReportFoldering] Creating NEW folder - this should NOT happen for continuum!");
    const newFolderModel = { userId };
    const saveFolderData = await saveToSupabase(
      "folders",
      newFolderModel
    ).catch((error) => console.log(error));
    console.log("saveFolderData", saveFolderData);

    return saveFolderData[0].folderId;
  };

  console.log("addParentToFolder parentReportId");
  console.log(parentReportId);

  await addParentToFolder(parentReportId);

  await addChildReportToFolder({
    reportId,
    folderId: existingFolderId,
  });

  async function addParentToFolder(parentReportId) {
    const supabase = getSupabase();

    if (parentReportId) {
      // Check if parent report already has a folder
      let { data: reportFolderResponse, error } = await supabase
        .from("reportFolders")
        .select("folderId")
        .eq("reportId", parentReportId);

      console.log("[handleReportFoldering] Looking up folder for parent report:", parentReportId);
      console.log("[handleReportFoldering] Folder lookup result:", reportFolderResponse, "error:", error);

      if (reportFolderResponse && reportFolderResponse.length > 0) {
        existingFolderId = reportFolderResponse[0].folderId;
        console.log("[handleReportFoldering] Using existing folder:", existingFolderId);
      } else {
        // Parent report is not in any folder, create a new folder and add parent report to it
        console.log("[handleReportFoldering] Parent report has no folder, creating new one");
        existingFolderId = await createNewFolder();

        newReportFolderModel = {
          reportId: parentReportId,
          folderId: existingFolderId,
        };
        await saveNewFolderModel(newReportFolderModel);
      }
    } else {
      // If there's no parent, create a new folder and add the report to it
      console.log("[handleReportFoldering] No parentReportId provided, creating new folder");
      existingFolderId = await createNewFolder();
    }
  }
  async function addChildReportToFolder({ reportId, folderId }) {
    newReportFolderModel = {
      reportId,
      folderId,
    };
    await saveNewFolderModel(newReportFolderModel);
  }

  return { folderId: existingFolderId };
}
