// @author Marvin-Rhone
import { generateWithMidjourney } from "../../../utils/midjourney.js";

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dcf11wsow/image/upload/v1697948290/c5ejkmxbucery6xnz2mg.png";

export default async function handler(req, res) {
  console.log("GENERATE REPORT IMAGE ENDPOINT");
  console.log(req.body);
  const { imageDescriptionResponseContent } = req.body;

  if (!imageDescriptionResponseContent) {
    return { imageUrl: FALLBACK_IMAGE };
  }

  const imageUrl = await generateWithMidjourney(
    imageDescriptionResponseContent,
    "16:9"
  );

  return { imageUrl };
}
