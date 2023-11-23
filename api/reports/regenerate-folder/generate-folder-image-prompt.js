import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  const { folderDescription } = req.body;
  // const imageType = "realist painting";
  // "realist painting",
  // "impressionist painting",

  try {
    const chat_completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You specialize in generating a vivid visual description of an image for a  topic. Your total response is always less than 300 characters. Your goal is to describe an image for Dall-E that gives an immediate understanding and context to the subject. Play to the strengths of Dall-E and away from its limitations. You don't need to explain your answer.",
        },
        {
          role: "user",
          content: `Produce a visually engaging prompt for Dall-E that encapsulates the essence of the report titled: ${folderDescription}, synthwave style. 
            ", "
          )}`,
        },
      ],
    });

    const folderImageResponse = chat_completion.choices[0].message.content;
    console.log("folderImageResponse2");
    console.log(folderImageResponse);
    return { folderImageResponse };
  } catch (error) {
    console.log("error");
    console.log(error);
    return console.log({ error });
  }
  // await saveToLinksTableFunction();
}

const visualStyles = [
  // "photograph",
  "realist painting",
  // "impressionist painting",
  // "illustration",
  // "3d rendering",
  // "digital art",
];
