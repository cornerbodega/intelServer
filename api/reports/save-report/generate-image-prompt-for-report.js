// import { getFromOpenAi } from "../../utils/getFromOpenAi.js";
import getFromOpenAi from "../../../utils/getFromOpenAi.js";

export default async function handler(req, res) {
  const { draft } = req.body;
  console.log("GET IMAGE PROMPT FOR REPORT ENDPOINT");
  //   console.log(req.body);
  //   console.log(draft);

  const draftTitle = draft.split(`<h2 id="reportTitle">`)[1].split(`</h2>`)[0];
  // describe this article as a photograph of place on earth in less than 300 characters: Research Report: Impact of Persistence and Goal-Setting on Project Success and Performance in Different Industries
  // const imageTypes = [
  //   "photograph",
  //   "realist painting",
  //   "impressionist painting",
  // ];
  // const imageType = imageTypes[getRandomInt(0, imageTypes.length - 1)];
  const imageType = "photograph";
  const getDraftImageMessages = [
    {
      role: "system",
      content:
        "You are an expert an designing images of places and describing them in less than 300 characters.",
    },
    {
      role: "user",
      content: `describe a ${imageType} of the place in nature that corresponds to this title in less than 300 characters: ${draftTitle}. The location will be the subject of a landscape photographer.`,
    },
  ];

  const imageDescriptionResponseContent = await getFromOpenAi(
    getDraftImageMessages
  );
  return { imageDescriptionResponseContent, draftTitle };
}
