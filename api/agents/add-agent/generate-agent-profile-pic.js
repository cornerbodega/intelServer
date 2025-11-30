import lodash from "lodash";

const { get } = lodash;

import "dotenv/config";
import { generateWithMidjourney } from "../../../utils/midjourney.js";
import { getSupabase } from "../../../utils/supabase.js";

export default async function generateAgentProfilePicHandler(req, res) {
  const supabase = getSupabase();
  console.log("GENERATE AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);

  if (req.body.agentId) {
    console.log(`[Generate Agent Profile Pic] Agent already has an id`);
    return { agentId: req.body.agentId };
  }

  const existingAgentId = req.body.existingAgentId;
  const expertiseOutput = req.body.expertiseOutput;
  const expertiseString = expertiseOutput.join(" and ");
  console.log("expertiseString");
  console.log(expertiseString);

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
  const prompt = `front facing photograph of a ${agentName} doing field research for a report on ${expertiseString}, Aesthetically appealing colors`;

  const imageUrl = await generateWithMidjourney(prompt, "1:1");

  return { imageUrl };
}
