// import { getFromOpenAi } from "../../utils/getFromOpenAi.js";
import getFromOpenAi from "../../../utils/getFromOpenAi.js";

export default async function handler(req, res) {
  const { draft } = req.body;
  console.log("GET IMAGE PROMPT FOR REPORT ENDPOINT");
  //   console.log(req.body);
  //   console.log(draft);

  let draftTitle = "";
  try {
    draftTitle = draft.split(`<h2 id="reportTitle">`)[1].split(`</h2>`)[0];
  } catch {
    return { error: "Errror Generating Image: Could not get draft title" };
  }

  // describe this article as a photograph of place on earth in less than 300 characters: Research Report: Impact of Persistence and Goal-Setting on Project Success and Performance in Different Industries
  const imageTypes = [
    "photograph",
    "realist painting",
    "impressionist painting",
    "macro photograph",
    "cartoon",
    "3d rendering",
  ];
  const imageType = imageTypes[getRandomInt(0, imageTypes.length - 1)];
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // const imageType = "macro photograph";
  const getDraftImageMessages = [
    {
      role: "system",
      content:
        "You are an expert an designing images of places and describing them in less than 300 characters.",
    },
    {
      role: "user",
      content: `describe a ${imageType} of the place that corresponds to this title in less than 300 characters: ${draftTitle}. The location will be used my dall-e to create an image for immersive context for the report.`,
    },
  ];

  const imageDescriptionResponseContent = await getFromOpenAi(
    getDraftImageMessages
  );
  // imageDescriptionResponseContent = `${imageDescriptionResponseContent}, photograph`;
  return { imageDescriptionResponseContent, draftTitle };
}
