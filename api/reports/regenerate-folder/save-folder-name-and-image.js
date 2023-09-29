import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  const supabase = getSupabase();
  console.log("SAVE FOLDER NAME AND IMAGE");
  console.log("Input:");
  console.log(req.body);
  const { folderName, folderPicUrl, folderDescription, folderId } = req.body;

  const folderNameAndImage = { folderName, folderPicUrl, folderDescription };
  console.log("folderNameAndImage", folderNameAndImage);
  console.log("folderNameAndImageexistingFolderId");
  // console.log(existingFolderId);
  // Update folder details
  const updatedFolderData = await updateFolderData(
    folderId,
    folderNameAndImage
  );
  async function updateFolderData(folderId, folderNameAndImage) {
    try {
      const { data, error } = await supabase
        .from("folders")
        .update({
          folderName: folderNameAndImage.folderName,
          folderPicUrl: folderNameAndImage.folderPicUrl,
          folderDescription: folderNameAndImage.folderDescription,
        })
        .eq("folderId", folderId);

      if (error) {
        console.log(error);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  //return({

  return {};
}
