import OpenAI from "openai";
const OPENAI_API_KEY = "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";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function generateEpisodeScriptHtmlHandler(req, res) {
  console.log("GENERATE EPISODE HTML SCRIPT ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { episodeScriptWithImageDescriptions } = req.body;

  // const { agentName, agentId, agentProfilePicUrl } = req.body;
  // const teaScript = `Hi, I'm ${agentName}, your personal financial assistant. I'm here to help you make better investment decisions. I'm a virtual agent, so I can't give you advice, but I can help you make better decisions. I can help you find the right investm`;

  async function generateEpisodeScriptHtml() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `you take in a string and return the entire string as self contained and styled html inside <div> tags`,
          },

          {
            role: "user",
            content: `${JSON.stringify(episodeScriptWithImageDescriptions)}`,
          },
        ],
      });
      console.log(" genereate html for episode response");
      console.log(response);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in generating episode html text:", error);
      throw error;
    }
  }
  const episodeScriptHtml = await generateEpisodeScriptHtml();
  console.log("episodeScriptHtml");
  console.log(episodeScriptHtml);
  return {
    episodeScriptHtml,
  };
}
