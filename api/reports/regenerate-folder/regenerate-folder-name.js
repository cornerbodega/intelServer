// @author Marvin Rhone
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  const supabase = getSupabase();
  const folderId = req.body.folderId;
  let folderName = "";
  let folderPicUrl = "";
  let folderDescription = "";
  // get all reports in folder
  let { data: reportFolders, reportFolderError } = await supabase
    .from("reportFolders")
    .select(
      `
      *,
      reports:reportId (reportTitle)
    `
    )
    .eq("folderId", folderId);
  if (reportFolderError) {
    console.log("reportFolderError");
  }
  console.log("genenerate folder name reportFolders");
  console.log(reportFolders);
  // let folderName = "";
  // let folderPicUrl = "";
  if (reportFolders && reportFolders.length > 0) {
    // generate folder name and image based on report contents
    // this function will be called when
    //  1. the child report is saved into new report is saved into a folder
    //  2. a new child report is saved into the folder
    // get all report titles

    // Get all the reports titles in this folder
    const reportTitles = reportFolders.map((reportFolder) => {
      if (reportFolder.reports) {
        return reportFolder.reports.reportTitle;
      }
    });
    console.log("regenerateFolderNameAndImage reportTitles");
    console.log(reportTitles);
    // Make a call to the AI to generate a folder name and image
    try {
      const chat_completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at generating a name and description for a folder based on titles of the reports it contains. You never explain your answer. You return results in the following JSON format: {folderName, folderDescription}",
          },
          {
            role: "user",
            content: reportTitles.join("\n"),
          },
        ],
      });
      // let folderName = "";

      const folderAssetResponseContent =
        chat_completion.choices[0].message.content;
      if (folderAssetResponseContent) {
        console.log("folderAssetResponseContent");
        console.log(folderAssetResponseContent);
        console.log("folderName");
        console.log(folderName);
        console.log("typeof folderAssetResponseContent");
        console.log(typeof folderAssetResponseContent);
        if (typeof folderAssetResponseContent === "object") {
          folderName = folderAssetResponseContent.folderName;
          folderDescription = folderAssetResponseContent.folderDescription;
        } else if (
          typeof folderAssetResponseContent === "string" &&
          folderAssetResponseContent.includes(`"folderName":`)
        ) {
          const parsedFolderAssetContent = JSON.parse(
            folderAssetResponseContent
          );
          if (parsedFolderAssetContent) {
            folderName = parsedFolderAssetContent.folderName;
            folderDescription = parsedFolderAssetContent.folderDescription;
          }
        } else if (typeof folderAssetResponseContent === "string") {
          folderName = folderAssetResponseContent;
          folderDescription = folderAssetResponseContent;
        }
      }
      console.log("folderName2");
      console.log(folderName);
      console.log("folderDescription");
      console.log(folderDescription);

      // "realist painting",
      // "impressionist painting",
      return { folderName, folderDescription };
    } catch (error) {
      console.error("generateFolderName error");
      console.log(error);
      return console.log({ error: error.message });
    }
    // Get the image from Dall-E
    // Folder title x animal name
  }

  // await saveToLinksTableFunction();
}
