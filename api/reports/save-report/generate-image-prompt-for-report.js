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
    "photograph",
    "realist painting",
    "impressionist painting",
    "illustration",
    "3d rendering",
    "digital art",
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
        "You specialize in generating vivid visual representations for various topics. Your goal is to create images that give an immediate understanding and context to the subject. You don't need to explain your answers.",
    },
    {
      role: "user",
      content: `Produce a visually engaging representation that encapsulates the essence of the report titled: ${draftTitle}. Imagine blending 2-3 of the following styles to best visualize the report's theme: ${visualStyles.join(
        ", "
      )}`,
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
