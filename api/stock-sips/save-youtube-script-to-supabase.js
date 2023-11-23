// import saveToSupabase from "../../../utils/saveToSupabase.js";
import saveToSupabase from "../../utils/saveToSupabase.js";
export default async function saveYoutubeScriptToSupabaseHandler(req, res) {
  console.log("SAVE YOUTUBE SCRIPT TO SUPABASE ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const {
    episodeScript,
    episodeScriptHtml,
    channelName,
    showName,
    episodeName,
    companyName,
    companyTicker,
    userId,
  } = req.body;
  const newYoutubeScriptModel = {
    channelName,
    showName,
    episodeName,
    episodeScript,
    episodeScriptHtml,
    companyName,
    companyTicker,
    userId,
  };
  const savedScriptData = await saveToSupabase(
    "youtubeScripts",
    newYoutubeScriptModel
  ).catch((error) => console.log(error));
  const scriptId = savedScriptData[0].scriptId;
  return scriptId;
}
