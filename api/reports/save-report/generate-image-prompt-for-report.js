import getFromOpenAi from "../../../utils/getFromOpenAi.js";

export default async function handler(req, res) {
  const { draft } = req.body;
  console.log("GET IMAGE PROMPT FOR REPORT ENDPOINT1");

  let draftTitle = "";
  try {
    draftTitle = draft.split(`<h2 id="reportTitle">`)[1].split(`</h2>`)[0];
  } catch {
    return console.log("Errror Generating Image: Could not get draft title");
  }

  const visualStyles = [
    "macro photograph",
    // "realist painting",
    // "impressionist painting",
    // "illustration",
    // "3d rendering",
    // "digital art",
  ];

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getDraftImageMessages = [
    {
      role: "system",
      content:
        "You specialize in generating a vivid visual description of an image for a  topic. Your total response is always less than 100 words. Your goal is to describe an image for Dall-E that gives an immediate understanding and context to the subject. Play to the strengths of Dall-E and away from its limitations. You don't need to explain your answer.",
    },
    {
      role: "user",
      content: `In less than 300 characters: Produce a visually engaging prompt for Dall-E that encapsulates the essence of the report titled: ${draftTitle}. Synthwave style.`,
    },
  ];

  const imageDescriptionResponseContent = await getFromOpenAi(
    getDraftImageMessages
  );

  console.log("imageDescriptionResponseContent1");
  console.log(imageDescriptionResponseContent);

  return { imageDescriptionResponseContent, draftTitle };
}

// function getVisualStyles() {
//   return `
// photograph
// realist painting
// impressionist painting
// illustration
// 3d rendering
// digital art`;
// }
