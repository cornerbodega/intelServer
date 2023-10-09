import lodash from "lodash";

const { get } = lodash;

import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function generateExpertiseHandler(req, res) {
  console.log("GENERATE EXPERTISE ENDPOINT");
  console.log(req);
  console.log("Input:");
  console.log(req.body);
  const briefingInput = get(req, "body.briefingInput");
  console.log("GENERATE EXPERTISE FUNCTION");
  console.log("Input");
  console.log(briefingInput);

  const expertiseCompletion = await openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Your task is to identify up to three areas of expertise beneficial for further research on a given topic. Always return the results directly as a raw JSON array of strings, containing between one and three elements. Do not wrap the array in an object or provide any additional explanations or keys. Respond directly with the array.",
        },
        {
          role: "user",
          content: `making software that makes millions of dollars`,
        },

        {
          role: "assistant",
          content: `["Software development", "Entrepreneurship", "Product management"]`,
        },
        {
          role: "user",
          content: `${briefingInput} `,
        },
      ],
    })
    .catch((error) => console.error(error));

  const expertiseResponse = JSON.parse(
    expertiseCompletion.choices[0].message.content
  );
  console.log("Output: create agent expertiseResponse");
  console.log(expertiseResponse);

  return { expertiseOutput: expertiseResponse };
}
