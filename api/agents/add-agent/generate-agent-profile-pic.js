import lodash from "lodash";

const { get } = lodash;

import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function generateAgentProfilePicHandler(req, res) {
  console.log("GENERATE AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const agentName = get(req, "body.agentName");
  const aiImageResponse = await openai.images.generate({
    prompt: `front facing photograph of a wild ${agentName}`,
    n: 1,
    size: "1024x1024",
  });
  const imageUrl = aiImageResponse.data[0].url;
  return { imageUrl };
}
