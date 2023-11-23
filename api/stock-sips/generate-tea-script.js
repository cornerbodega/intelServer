import OpenAI from "openai";
const OPENAI_API_KEY = "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";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function generateTeaScriptHandler(req, res) {
  console.log("GENERATE TEA SCRIPT ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { teaName } = req.body;
  // const { agentName, agentId, agentProfilePicUrl } = req.body;
  // const teaScript = `Hi, I'm ${agentName}, your personal financial assistant. I'm here to help you make better investment decisions. I'm a virtual agent, so I can't give you advice, but I can help you make better decisions. I can help you find the right investm`;

  async function createTeaScript() {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert on everything tea: history, preparation, effects, culture, etc.  You are a researcher for a TV show that educates the audience by reviewing hundreds of teas, one per episode. You receive a tea name and respond with details about the tea in bullet point form. Return only the results and no explanation.`,
        },

        {
          role: "user",
          content: `${teaName}`,
        },
      ],
    });
    // console.log();
    console.log(" genereate tea script response");
    console.log(response);
    return response.choices[0].message.content;
  }
  const teaScript = await createTeaScript();
  return { teaScript };

  // Tea History
  // Region
  // Culture
  // How to Drink
  // Health Benefits

  // Explain all the above in verse optimized by LCCS
  // My honest unfiltered review based on my pallete: Buy or Pass
}
