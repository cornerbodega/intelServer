// @author Marvin-Rhone
import { generateWithMidjourney } from "../../../utils/midjourney.js";

export default async function handler(req, res) {
  console.log("GENERATE FOLDER IMAGE ENDPOINT");
  const folderImageResponse = req.body.folderImageResponse;

  const imageUrl = await generateWithMidjourney(folderImageResponse, "16:9");

  return { imageUrl };
}
