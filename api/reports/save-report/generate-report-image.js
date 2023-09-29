// @author Marvin-Rhone
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("GENERATE REPORT IMAGE ENDPOINT");
  console.log(req.body);
  const { imageDescriptionResponseContent } = req.body;
  const aiImageResponse = await openai.images
    .generate({
      prompt: `${imageDescriptionResponseContent}`,
      n: 1,
      size: "1024x1024",
    })
    .catch((error) => {
      console.log(error);
    });
  const imageUrl = aiImageResponse.data[0].url;
  return { imageUrl };
}
