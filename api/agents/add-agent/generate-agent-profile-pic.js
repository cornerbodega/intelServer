import lodash from "lodash";

const { get } = lodash;

import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { getSupabase } from "../../../utils/supabase.js";
export default async function generateAgentProfilePicHandler(req, res) {
  const supabase = getSupabase();
  console.log("GENERATE AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const existingAgentId = req.body.existingAgentId;
  if (existingAgentId) {
    // get existing agent name
    const { data: existingAgentData, error: existingAgentError } =
      await supabase
        .from("agents")
        .select("profilePicUrl")
        .eq("agentId", existingAgentId);
    if (existingAgentError) {
      console.log("error getting existingAgentData");
      console.log(existingAgentError);
    }
    return { imageUrl: existingAgentData[0].profilePicUrl };
  }
  const agentName = get(req, "body.agentName");
  const aiImageResponse = await openai.images.generate({
    prompt: `front facing photograph of a wild ${agentName}, synthwave style`,
    n: 1,
    size: "1024x1024",
  });
  const imageUrl = aiImageResponse.data[0].url;
  return { imageUrl };
}
