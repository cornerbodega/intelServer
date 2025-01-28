import getFromOpenAi from "../../../utils/getFromOpenAi.js";

export default async function handler(req, res) {
  const { draft } = req.body;

  let draftTitle = "";
  try {
    draftTitle = draft.split(`<h2 id="reportTitle">`)[1].split(`</h2>`)[0];
  } catch {
    return console.log("Errror Generating Image: Could not get draft title");
  }

  const getDraftImageMessages = [
    {
      role: "system",
      content:
        "Your task is to create a compelling visual description suitable for generating an image with Dall-E. Your response should not exceed 100 words and must provide clear context and thematic elements of the given topic. Focus on creating a prompt that highlights thematic essence and emotional impact, steering clear of specific copyrighted content, direct quotes, or explicit references to individuals or sensitive topics. Your description should leverage Dall-E's strengths in generating vibrant, imaginative visuals without running afoul of content guidelines. There's no need to explain your approach, but ensure the prompt is creatively rich and adheres to all safety guidelines.",
    },

    {
      role: "user",
      content: `Craft a Dall-E prompt under 300 characters ${draftTitle} with a focus on the theme of the report. Use an engaging 3D painted art style for the image. Aesthetically appealing color influence.`,
    },
  ];

  const imageDescriptionResponseContent = await getFromOpenAi(
    getDraftImageMessages
  ).catch((error) => {
    console.log("error");
    console.log(error);
    return console.log({ error });
  });

  return { imageDescriptionResponseContent, draftTitle };
}
// drawing from themes of love's transformative power and mystery, visualized through a synthwave lens. Focus on a neon-lit rose symbolizing renewal and an abstract figure embodying change. Aim for a visual narrative that speaks to universal experiences of growth and understanding, using vibrant colors and futuristic elements without referencing specific copyrighted materials or individuals.
