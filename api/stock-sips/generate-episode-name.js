import OpenAI from "openai";
const OPENAI_API_KEY = "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";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function generateEpisodeNameHandler(req, res) {
  console.log("GENERATE EPISODE NAME ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { teaName, companyName, companyTicker, snackName } = req.body;
  // const { agentName, agentId, agentProfilePicUrl } = req.body;
  // const teaScript = `Hi, I'm ${agentName}, your personal financial assistant. I'm here to help you make better investment decisions. I'm a virtual agent, so I can't give you advice, but I can help you make better decisions. I can help you find the right investm`;

  const engageMax = `Emotional Trigger Words (Power Words Usage: 8)

  Titles should incorporate emotionally resonant and powerful words to enhance click-through rates.
  Specificity and Precision (Detail Level: 7)
  
  Incorporate specific details or statistics to add credibility and interest.
  Use of Questions or Rhetorical Devices
  
  Rhetorical Question (7): Use questions that provoke thought or interest.
  Alliteration or Rhyme (6): Employ literary devices for memorability.
  Personalization and Direct Address (Direct Address: 8)
  
  Speak directly to the viewer for a more personal connection.
  Incorporation of Visual or Sensory Language (Imagery: 6)
  
  Use descriptive language to help viewers visualize content.
  Hashtags and Emoji Use (Trendy Symbols: 5)
  
  Include relevant hashtags or emojis for enhanced engagement.
  A/B Testing Potential (Variability for Testing: 6)
  
  Create title variations for A/B testing effectiveness.
  Contrast and Comparison (Comparative Elements: 7)
  
  Use contrasts or comparisons to add intrigue.
  Utilizing a Storytelling Approach (Narrative Tease: 8)
  
  Hint at a story or journey in the title.
  Inclusivity and Diversity (Universal Appeal: 7)
  
  Ensure titles are inclusive and appeal to a diverse audience.
  Timing and Seasonality (Seasonal Relevance: 6)
  
  Align titles with current seasons, holidays, or events.
  Relevance to Content
  
  Direct Match (9), Misleading Factor (9): Ensure titles accurately reflect content and are not misleading.
  SEO Optimization
  
  Keyword Inclusion (9), Search Volume & Competition (8): Include relevant, popular keywords.
  Engagement and Curiosity
  
  Intrigue Factor (8), Emotional Appeal (8): Titles should be intriguing and emotionally appealing.
  Clarity and Conciseness
  
  Brevity (7), Understandability (8): Keep titles concise and understandable.
  Uniqueness and Branding
  
  Distinctiveness (8), Consistency with Channel Branding (7): Titles should be unique and align with channel branding.
  Trending Topics and Timeliness
  
  Current Relevance (8), Evergreen Potential (7): Titles should be timely and have long-term relevance.
  Audience Targeting
  
  Target Audience Clarity (8), Age Appropriateness (6): Tailor titles to the target audience.
  Call to Action or Provocation
  
  Engagement Prompt (9), Question Posing (8): Encourage viewership without being clickbaity.
  Use of Numbers and Lists (List Format: 6)
  
  Effectively use numbers or lists in titles.
  Cultural and Linguistic Considerations
  
  Cultural Sensitivity (7), Language and Localization (7): Titles should be culturally sensitive and localized if necessary.`;
  async function generateEpisodeName() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert at reading a script and coming up with a catchy episode name. The show is called Stock Sips with Marvin on the Youtube Channel Marvin da Millenium Macchiiato @macchiiato. Each episode the host reviews a stock, a tea, and a snack. writing based on the following rubric: ${engageMax}. The episode name must include the specific ticker, tea, and snack name in the title. The episode name must be catchy and engaging. Return only the name and don't explain your answer.`,
          },

          {
            role: "user",
            content: `Please write a title for the episode for: ${teaName}, ${snackName}, ${companyName} $${companyTicker}that teases my review of the episode and maximizes engagement.`,
          },
        ],
      });
      console.log(" genereate episode name from script response");
      console.log(response);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in generating episode name text:", error);
      throw error;
    }
  }
  const episodeName = await generateEpisodeName();
  return { episodeName };

  // Tea History
  // Region
  // Culture
  // How to Drink
  // Health Benefits

  // Explain all the above in verse optimized by LCCS
  // My honest unfiltered review based on my pallete: Buy or Pass
}
