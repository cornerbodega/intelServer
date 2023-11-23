import OpenAI from "openai";
const OPENAI_API_KEY = "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";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function generateEpisodeScriptWithImageDescriptionsHandler(
  req,
  res
) {
  console.log("GENERATE EPISODE SCRIPT WITH IMAGE DESCRIPTIONS ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { episodeScript } = req.body;

  // const { agentName, agentId, agentProfilePicUrl } = req.body;
  // const teaScript = `Hi, I'm ${agentName}, your personal financial assistant. I'm here to help you make better investment decisions. I'm a virtual agent, so I can't give you advice, but I can help you make better decisions. I can help you find the right investm`;

  async function generateEpisodeScriptWithImageDescriptions() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert at reading a script and coming up with detailed descriptions for ideal optimal background art for each moment. Each place you see opportunity for a new background, insert a background description into the script. Make each background description as vivid and detailed and awe-inspiring and captivating as possible in under 300 characters. You are given a script in plain text and you return the same entire script with background descriptions inserted. There should be at least 6 background descriptions for each 30 seconds of script.`,
          },

          {
            role: "user",
            content: `${episodeScript}`,
          },
        ],
      });
      console.log(" genereate image prompts for episode response");
      console.log(response);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in generating episode image text:", error);
      throw error;
    }
  }
  const episodeScriptWithImageDescriptions =
    await generateEpisodeScriptWithImageDescriptions();
  console.log("episodeScriptWithImageDescriptions");
  console.log(episodeScriptWithImageDescriptions);
  return {
    episodeScriptWithImageDescriptions,
  };
}
